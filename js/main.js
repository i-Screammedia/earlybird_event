(() => {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Scroll reveal for sections
  if (!prefersReduced && "IntersectionObserver" in window) {
    const targets = document.querySelectorAll(
      ".section__head, .adoption__stats, .review-card, .feature-row, .feature-highlight, .gift-pack, .benefits-banner, .benefits-actions, .gift-notes, .compare__col, .step, .howto__item, .prep-note, .form, .notice__list"
    );

    targets.forEach((el) => el.classList.add("reveal"));

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
    );

    targets.forEach((el) => io.observe(el));
  }

  // Gift pack CTA → preselect form option
  document.querySelectorAll('.gift-pack .btn[href="#apply"]').forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const gift = document.getElementById("gift");
      if (gift) gift.value = index === 0 ? "pack1" : "pack2";
    });
  });

  // Google Form as submission DB
  // https://docs.google.com/forms/d/1znzX4wwGUXiPuNY2yHoVIlkS4iFMHOUuROIuZ0dgAtM/edit
  const GOOGLE_FORM = {
    action:
      "https://docs.google.com/forms/d/e/1FAIpQLScg_cI8onxcjYdjK8f11nZoBuiUlao8TVq7S9kyJMNm5NLuSQ/formResponse",
    entries: {
      office: "entry.1679036734",
      school: "entry.2133529315",
      name: "entry.400100134",
      phone: "entry.718301232",
      email: "entry.726953345",
      subject: "entry.1145712823",
      grade: "entry.2060274946",
      accounts: "entry.170032590",
      gift: "entry.1462146372",
      privacy: "entry.331149771",
      submitCheck: "entry.1359851501",
    },
    giftValues: {
      pack1: "구성 01. 전자 호루라기&계수기 + 화이트보드&마커",
      pack2: "구성 02. 클래스 LED 타이머 + 미술 플레이북",
    },
    privacyValue: "개인 정보 수집 및 이용에 동의 합니다.",
    submitCheckValue: "체크하고 제출 버튼을 클릭해주세요.",
  };

  const PHONE_PATTERN = /^\d{3}-\d{3,4}-\d{4}$/;

  const formatPhone = (value) => {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 10) {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  };

  // Privacy required → enable submit
  const form = document.querySelector(".form");
  const privacyCheck = document.getElementById("privacy");
  const submitBtn = document.getElementById("submit-btn");
  const phoneInput = document.getElementById("phone");

  const syncSubmitByPrivacy = () => {
    if (!privacyCheck || !submitBtn) return;
    if (submitBtn.dataset.loading === "1") return;
    submitBtn.disabled = !privacyCheck.checked;
  };

  if (privacyCheck) {
    privacyCheck.addEventListener("change", syncSubmitByPrivacy);
    syncSubmitByPrivacy();
  }

  if (phoneInput) {
    phoneInput.addEventListener("input", () => {
      const next = formatPhone(phoneInput.value);
      if (phoneInput.value !== next) phoneInput.value = next;
    });
  }

  // Subject/grade multi-select picker
  const bookPicker = document.getElementById("book-picker");

  const syncGradeRow = (gradeInput, { focusCount = false } = {}) => {
    const item = gradeInput.closest(".book-picker__item");
    const countInput = item?.querySelector(".book-picker__count");
    if (!countInput) return;
    countInput.disabled = !gradeInput.checked;
    if (!gradeInput.checked) countInput.value = "";
    else if (focusCount) countInput.focus();
  };

  const syncSubjectGroup = (subject) => {
    const group = bookPicker?.querySelector(`.book-picker__group[data-subject="${subject}"]`);
    const subjectToggle = group?.querySelector(".book-picker__subject-toggle");
    if (!group || !subjectToggle) return;
    const gradeInputs = [...group.querySelectorAll(".book-picker__grade")];
    const anyChecked = gradeInputs.some((input) => input.checked);
    subjectToggle.checked = anyChecked;
  };

  const collectBookSelections = () => {
    if (!bookPicker) return [];
    return [...bookPicker.querySelectorAll(".book-picker__grade:checked")].map((input) => {
      const item = input.closest(".book-picker__item");
      const count = item?.querySelector(".book-picker__count")?.value?.trim() || "";
      return {
        subject: input.dataset.subject || "",
        label: input.dataset.label || "",
        count,
      };
    });
  };

  const resetBookPicker = () => {
    if (!bookPicker) return;
    bookPicker.querySelectorAll(".book-picker__grade, .book-picker__subject-toggle").forEach((input) => {
      input.checked = false;
    });
    bookPicker.querySelectorAll(".book-picker__count").forEach((input) => {
      input.value = "";
      input.disabled = true;
    });
    bookPicker.querySelectorAll(".book-picker__group").forEach((group) => {
      group.classList.remove("is-open");
      const body = group.querySelector(".book-picker__body");
      const toggle = group.querySelector(".book-picker__toggle");
      if (body) body.hidden = true;
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    });
  };

  if (bookPicker) {
    bookPicker.querySelectorAll(".book-picker__toggle").forEach((btn) => {
      btn.addEventListener("click", () => {
        const group = btn.closest(".book-picker__group");
        if (!group) return;
        const open = !group.classList.contains("is-open");
        group.classList.toggle("is-open", open);
        const body = group.querySelector(".book-picker__body");
        if (body) body.hidden = !open;
        btn.setAttribute("aria-expanded", open ? "true" : "false");
      });
    });

    bookPicker.querySelectorAll(".book-picker__subject-toggle").forEach((toggle) => {
      toggle.addEventListener("change", () => {
        const subject = toggle.dataset.subject;
        const group = bookPicker.querySelector(`.book-picker__group[data-subject="${subject}"]`);
        if (!group) return;
        group.classList.add("is-open");
        const body = group.querySelector(".book-picker__body");
        const headBtn = group.querySelector(".book-picker__toggle");
        if (body) body.hidden = false;
        if (headBtn) headBtn.setAttribute("aria-expanded", "true");

        group.querySelectorAll(".book-picker__grade").forEach((gradeInput) => {
          gradeInput.checked = toggle.checked;
          syncGradeRow(gradeInput);
        });
      });
    });

    bookPicker.querySelectorAll(".book-picker__grade").forEach((gradeInput) => {
      gradeInput.addEventListener("change", () => {
        syncGradeRow(gradeInput, { focusCount: true });
        syncSubjectGroup(gradeInput.dataset.subject);
      });
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      if (!privacyCheck?.checked) {
        privacyCheck?.focus();
        alert("개인정보 수집·이용에 동의해 주세요.");
        return;
      }

      const office = form.office?.value?.trim() || "";
      const school = form.school?.value?.trim() || "";
      const name = form.name?.value?.trim() || "";
      const phone = formatPhone(form.phone?.value || "");
      const email = form.email?.value?.trim() || "";
      const selections = collectBookSelections();
      const giftKey = form.gift?.value || "";
      const giftValue = GOOGLE_FORM.giftValues[giftKey];

      if (phoneInput) phoneInput.value = phone;

      if (!office || !school || !name || !email || !giftValue) {
        alert("필수 항목을 모두 입력해 주세요.");
        return;
      }

      if (!selections.length) {
        alert("신청할 과목·학년을 하나 이상 선택해 주세요.");
        return;
      }

      const missingCount = selections.find((item) => !item.count || Number(item.count) < 1);
      if (missingCount) {
        alert(`${missingCount.label}의 계정수를 입력해 주세요.`);
        return;
      }

      if (!PHONE_PATTERN.test(phone)) {
        phoneInput?.focus();
        alert("연락처는 000-0000-0000 형식으로 입력해 주세요.");
        return;
      }

      const subjects = [...new Set(selections.map((item) => item.subject))];
      // 구글폼 과목/학년은 단일 선택형이라 대표값 전송, 상세 내역은 계정수 필드에 저장
      const subjectValue = subjects[0] || "";
      const firstGradeNum = (selections[0].label.match(/(\d)/) || [])[1];
      const gradeValue = firstGradeNum ? `${firstGradeNum}학년` : selections[0].label;
      const accounts = selections.map((item) => `${item.label} ${item.count}명`).join(" / ");

      if (submitBtn) {
        submitBtn.dataset.loading = "1";
        submitBtn.disabled = true;
        submitBtn.textContent = "신청 중...";
      }

      const body = new URLSearchParams();
      body.set(GOOGLE_FORM.entries.office, office);
      body.set(GOOGLE_FORM.entries.school, school);
      body.set(GOOGLE_FORM.entries.name, name);
      body.set(GOOGLE_FORM.entries.phone, phone);
      body.set(GOOGLE_FORM.entries.email, email);
      body.set(GOOGLE_FORM.entries.subject, subjectValue);
      body.set(GOOGLE_FORM.entries.grade, gradeValue);
      body.set(GOOGLE_FORM.entries.accounts, accounts);
      body.set(GOOGLE_FORM.entries.gift, giftValue);
      body.set(GOOGLE_FORM.entries.privacy, GOOGLE_FORM.privacyValue);
      body.set(GOOGLE_FORM.entries.submitCheck, GOOGLE_FORM.submitCheckValue);
      // Multi-page Google Form: page 1 (fields) + page 2 (consent)
      body.set("pageHistory", "0,1");

      try {
        await fetch(GOOGLE_FORM.action, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body,
        });

        form.reset();
        resetBookPicker();
        if (privacyCheck) privacyCheck.checked = false;
        alert("신청이 완료되었습니다. 감사합니다!");
      } catch (err) {
        console.error(err);
        alert("신청 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.");
      } finally {
        if (submitBtn) {
          submitBtn.dataset.loading = "0";
          submitBtn.textContent = "신청 완료하기";
        }
        syncSubmitByPrivacy();
      }
    });
  }
  // Privacy consent detail toggle
  const privacyToggle = document.querySelector(".consent-toggle");
  const privacyDetail = document.getElementById("privacy-detail");
  if (privacyToggle && privacyDetail) {
    privacyToggle.addEventListener("click", () => {
      const open = privacyToggle.getAttribute("aria-expanded") === "true";
      privacyToggle.setAttribute("aria-expanded", open ? "false" : "true");
      privacyToggle.setAttribute(
        "aria-label",
        open ? "개인정보 수집·이용 안내 펼치기" : "개인정보 수집·이용 안내 접기"
      );
      privacyDetail.hidden = open;
    });
  }

  // Review full-text modal
  const reviewModal = document.getElementById("reviewModal");
  const reviewModalBackdrop = document.getElementById("reviewModalBackdrop");
  const reviewModalClose = document.getElementById("reviewModalClose");
  const reviewModalName = document.getElementById("reviewModalName");
  const reviewModalSchool = document.getElementById("reviewModalSchool");
  const reviewModalBody = document.getElementById("reviewModalBody");
  let reviewLastFocused = null;

  const openReviewModal = (btn) => {
    if (!reviewModal || !reviewModalBody) return;
    const template = document.getElementById(`reviewFull-${btn.dataset.review}`);
    if (!template) return;

    reviewLastFocused = document.activeElement;
    reviewModalBody.innerHTML = "";
    reviewModalBody.appendChild(template.content.cloneNode(true));
    if (reviewModalName) reviewModalName.textContent = btn.dataset.reviewName || "";
    if (reviewModalSchool) reviewModalSchool.textContent = btn.dataset.reviewSchool || "";

    reviewModal.hidden = false;
    reviewModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    reviewModalClose?.focus();
  };

  const closeReviewModal = () => {
    if (!reviewModal) return;
    reviewModal.hidden = true;
    reviewModal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (reviewModalBody) reviewModalBody.innerHTML = "";
    reviewLastFocused?.focus();
  };

  document.querySelectorAll(".review-more-btn").forEach((btn) => {
    btn.addEventListener("click", () => openReviewModal(btn));
  });
  reviewModalClose?.addEventListener("click", closeReviewModal);
  reviewModalBackdrop?.addEventListener("click", closeReviewModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && reviewModal && !reviewModal.hidden) closeReviewModal();
  });

  // AIDT-style affiliate sitemap
  const sitemapBtn = document.querySelector(".site-footer__sitemap-btn");
  const sitemapMenu = document.getElementById("affiliate-menu");
  if (sitemapBtn && sitemapMenu) {
    sitemapBtn.addEventListener("click", () => {
      const open = sitemapBtn.classList.toggle("is-open");
      sitemapBtn.setAttribute("aria-expanded", open ? "true" : "false");
      sitemapMenu.hidden = !open;
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".site-footer__sitemap")) {
        sitemapBtn.classList.remove("is-open");
        sitemapBtn.setAttribute("aria-expanded", "false");
        sitemapMenu.hidden = true;
      }
    });
  }
})();
