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
  document.querySelectorAll('.gift-pack .btn[href="#apply"], .benefits-actions__btn[data-gift]').forEach((btn, index) => {
    btn.addEventListener("click", () => {
      const gift = document.getElementById("gift");
      if (!gift) return;
      const fromData = btn.getAttribute("data-gift");
      gift.value = fromData || (index === 0 ? "pack1" : "pack2");
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
      const giftKey = form.gift?.value || "";
      const giftValue = GOOGLE_FORM.giftValues[giftKey];

      if (phoneInput) phoneInput.value = phone;

      if (!office || !school || !name || !email || !giftValue) {
        alert("필수 항목을 모두 입력해 주세요.");
        return;
      }

      if (!PHONE_PATTERN.test(phone)) {
        phoneInput?.focus();
        alert("연락처는 000-0000-0000 형식으로 입력해 주세요.");
        return;
      }

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
