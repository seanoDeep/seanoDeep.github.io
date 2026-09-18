/* ================================================================
   Alex Chen | 个人作品集网站 - 交互脚本
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ========== 打字机效果 ========== */
  const typedEl = document.getElementById('typed-text');
  const words = [
    '产品赋能变现',
    '前端工程',
    '自动化办公',
    '内容创作者',
    '售前工程'
  ];
  let wordIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typeSpeed = 100;

  function type() {
    const current = words[wordIdx];
    if (isDeleting) {
      charIdx--;
      typeSpeed = 50;
    } else {
      charIdx++;
      typeSpeed = 100;
    }
    typedEl.textContent = current.substring(0, charIdx);

    if (!isDeleting && charIdx === current.length) {
      typeSpeed = 1500;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      wordIdx = (wordIdx + 1) % words.length;
      typeSpeed = 300;
    }
    setTimeout(type, typeSpeed);
  }
  type();

  /* ========== 主题切换 ========== */
  const themeToggle = document.getElementById('theme-toggle');
  const themeIcon = themeToggle.querySelector('i');
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
  });

  function updateThemeIcon(theme) {
    themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
  }

  /* ========== 导航栏滚动效果 ========== */
  const header = document.getElementById('header');
  const backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    // 导航栏阴影
    header.classList.toggle('scrolled', window.scrollY > 50);

    // 回到顶部按钮
    backToTop.classList.toggle('show', window.scrollY > 600);

    // 高亮当前导航链接
    updateActiveNav();
  });

  /* ========== 移动端菜单 ========== */
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navBackdrop = document.getElementById('nav-backdrop');

  function openMobileMenu() {
    navMenu.classList.add('show');
    navBackdrop.classList.add('show');
    navToggle.querySelector('i').className = 'fas fa-times';
    document.body.style.overflow = 'hidden';
    // 自动展开所有含内容的二级导航
    navMenu.querySelectorAll('.nav__dropdown-wrapper').forEach(w => {
      if (w.querySelector('.collapse-inner')) w.classList.add('open');
    });
    navMenu.querySelectorAll('.nav__submenu-wrapper').forEach(w => {
      if (w.querySelector('.collapse-inner')) w.classList.add('open');
    });
  }

  function closeMobileMenu() {
    navMenu.classList.remove('show');
    navBackdrop.classList.remove('show');
    navToggle.querySelector('i').className = 'fas fa-bars';
    document.body.style.overflow = '';
    // 收起所有展开的子菜单，重置状态
    navMenu.querySelectorAll('.nav__dropdown-wrapper.open, .nav__submenu-wrapper.open').forEach(w => {
      w.classList.remove('open');
    });
  }

  navToggle.addEventListener('click', () => {
    navMenu.classList.contains('show') ? closeMobileMenu() : openMobileMenu();
  });

  navBackdrop.addEventListener('click', closeMobileMenu);

  // 点击导航链接后关闭菜单（排除下拉触发链接）
  document.querySelectorAll('.nav__link:not(.nav__link--dropdown)').forEach(link => {
    link.addEventListener('click', () => closeMobileMenu());
  });

  /* ========== 移动端 Accordion 多级菜单 ========== */
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

  function isMobile() {
    return isTouchDevice || window.innerWidth <= 768;
  }

  /**
   * 关闭所有展开的一级菜单（及其内部的二级菜单）
   */
  function closeAllDropdowns() {
    document.querySelectorAll('.nav__dropdown-wrapper.open').forEach(w => {
      w.classList.remove('open');
      w.querySelectorAll('.nav__submenu-wrapper.open').forEach(sw => sw.classList.remove('open'));
    });
  }

  /**
   * 一级菜单点击：展开/收起（手风琴互斥）
   * 仅对含有 collapse-inner 的下拉生效，无内容的链接正常跳转
   */
  document.querySelectorAll('.nav__link--dropdown').forEach(dropdownLink => {
    const wrapper = dropdownLink.closest('.nav__dropdown-wrapper');
    const hasContent = wrapper && wrapper.querySelector('.collapse-inner');

    dropdownLink.addEventListener('click', function (e) {
      if (!hasContent) return; // 无下拉内容，放行默认跳转
      e.preventDefault();

      const wasOpen = wrapper.classList.contains('open');

      if (wasOpen) {
        // 收起当前（不影响其他已展开项）
        wrapper.classList.remove('open');
        wrapper.querySelectorAll('.nav__submenu-wrapper.open').forEach(sw => sw.classList.remove('open'));
      } else {
        // 展开：先关闭其他一级菜单（手风琴互斥）
        document.querySelectorAll('.nav__dropdown-wrapper.open').forEach(w => {
          if (w === wrapper) return;
          w.classList.remove('open');
          w.querySelectorAll('.nav__submenu-wrapper.open').forEach(sw => sw.classList.remove('open'));
        });
        wrapper.classList.add('open');
      }
    });
  });

  /**
   * 二级子菜单点击：展开/收起
   */
  document.querySelectorAll('.nav__dropdown-link--sub').forEach(subLink => {
    subLink.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      const wrapper = this.closest('.nav__submenu-wrapper');
      if (!wrapper) return;
      wrapper.classList.toggle('open');
    });
  });

  /**
   * 桌面端：点击外部关闭所有展开的下拉菜单
   */
  document.addEventListener('click', (e) => {
    if (isMobile()) return;
    // 点击在 nav__dropdown-wrapper 内部 → 不关闭
    if (e.target.closest('.nav__dropdown-wrapper')) return;
    closeAllDropdowns();
  });

  /**
   * 下拉菜单项（带筛选）点击：关闭菜单 → 滚动到作品区 → 触发筛选
   */
  document.querySelectorAll('.nav__dropdown-link[data-portfolio-filter]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (!isMobile()) return;
      e.preventDefault();
      closeMobileMenu();
      const homeSection = document.getElementById('home');
      if (homeSection) {
        homeSection.scrollIntoView({ behavior: 'smooth' });
      }
      setTimeout(() => {
        const filterBtn = document.querySelector(`.hero__carousel-filter[data-filter="${link.dataset.portfolioFilter}"]`);
        if (filterBtn) filterBtn.click();
      }, 400);
    });
  });

  /**
   * 其他下拉链接点击：关闭菜单（排除已单独处理的）
   */
  document.querySelectorAll('.nav__dropdown-link').forEach(link => {
    link.addEventListener('click', () => {
      if (!isMobile()) return;
      if (link.classList.contains('nav__dropdown-link--sub')) return;
      if (link.dataset.portfolioFilter) return;
      if (link.id === 'nav-resume-download') return;
      closeMobileMenu();
    });
  });

  /**
   * 简历下载：弹窗提示
   */
  document.getElementById('nav-resume-download')?.addEventListener('click', (e) => {
    if (!isMobile()) return;
    e.preventDefault();
    alert('请与管理员联系获取授权码');
    window.open('https://pan.baidu.com/s/1lZLtCSo5SQx34tonhAD1AQ', '_blank');
    closeMobileMenu();
  });

  /* ========== 当前导航高亮 ========== */
  function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav__link');
    let current = '';

    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  /* ========== 数字递增动画 ========== */
  function animateCounters() {
    document.querySelectorAll('.about__stat-number').forEach(counter => {
      const target = +counter.dataset.count;
      if (counter.dataset.animated) return;
      counter.dataset.animated = 'true';

      const duration = 2000;
      const step = (timestamp) => {
        if (!counter._start) counter._start = timestamp;
        const progress = Math.min((timestamp - counter._start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // ease-out
        counter.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ========== 滚动触发动画 ========== */
  const observerOptions = { threshold: 0.2, rootMargin: '0px 0px -50px 0px' };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // 数字递增
        if (entry.target.closest('#about')) animateCounters();
        // 通用 reveal 动画
        if (entry.target.classList.contains('reveal')) {
          entry.target.classList.add('visible');
        }
      }
    });
  }, observerOptions);

  // 观察 about 区域
  const aboutSection = document.getElementById('about');
  if (aboutSection) observer.observe(aboutSection);

  /* ========== 联系表单提交 ========== */
  const contactModal = document.getElementById('contact-modal');
  const contactModalClose = document.getElementById('contact-modal-close');
  const contactForm = document.getElementById('contact-form');

  // 打开联系弹窗
  function openContactModal() {
    if (contactModal) {
      contactModal.classList.add('show');
      document.body.style.overflow = 'hidden';
    }
  }

  // 关闭联系弹窗
  function closeContactModal() {
    if (contactModal) {
      contactModal.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  if (contactModalClose && contactModal) {
    contactModalClose.addEventListener('click', closeContactModal);
    contactModal.addEventListener('click', (e) => {
      if (e.target === contactModal) closeContactModal();
    });
  }

  // ESC 关闭联系弹窗
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && contactModal && contactModal.classList.contains('show')) {
      closeContactModal();
    }
  });

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = contactForm.querySelector('.btn');
      const btnText = btn.querySelector('.btn__text');
      const originalText = btnText.textContent;

      // 收集表单数据
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const subject = document.getElementById('contact-subject').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      // 构建邮件正文
      const body = `姓名：${name}\n邮箱：${email}\n主题：${subject || '（无）'}\n\n需求描述：\n${message}`;

      // 构建 mailto 链接
      const mailtoLink = `mailto:AAAAAA?subject=${encodeURIComponent(subject || '来自网站的咨询')}&body=${encodeURIComponent(body)}`;

      btnText.textContent = '唤起中...';
      btn.disabled = true;

      setTimeout(() => {
        window.location.href = mailtoLink;
        btnText.textContent = originalText;
        btn.disabled = false;
        contactForm.reset();
        closeContactModal();
      }, 500);
    });
  }

  /* ========== 页脚订阅表单 → 触发联系弹窗 ========== */
  const subscribeForm = document.getElementById('subscribe-form');
  const subscribeEmail = document.getElementById('subscribe-email');

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  if (subscribeForm) {
    subscribeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = subscribeEmail.value.trim();

      if (!email) {
        alert('请输入邮箱地址');
        return;
      }
      if (!validateEmail(email)) {
        alert('请输入有效的邮箱地址');
        return;
      }

      // 将邮箱预填到联系表单
      const contactEmailInput = document.getElementById('contact-email');
      if (contactEmailInput) {
        contactEmailInput.value = email;
      }

      openContactModal();
      subscribeForm.reset();
    });
  }

  /* ========== 初始触发（页面加载时已可见的元素） ========== */
  setTimeout(() => {
    const aboutRect = aboutSection?.getBoundingClientRect();
    if (aboutRect && aboutRect.top < window.innerHeight) animateCounters();
  }, 300);

  /* ========== 桌面端：下拉菜单项点击筛选 ========== */
  document.querySelectorAll('.nav__dropdown-link[data-portfolio-filter]').forEach(link => {
    link.addEventListener('click', (e) => {
      if (isMobile()) return; // 移动端由上面的 handler 处理
      e.preventDefault();
      const filterValue = link.dataset.portfolioFilter;
      const homeSection = document.getElementById('home');
      if (homeSection) homeSection.scrollIntoView({ behavior: 'smooth' });
      const filterBtn = document.querySelector(`.hero__carousel-filter[data-filter="${filterValue}"]`);
      if (filterBtn) {
        setTimeout(() => filterBtn.click(), 500);
      }
    });
  });

  /* ========== 登录 / 注册弹窗 ========== */
  const loginModal = document.getElementById('login-modal');
  const navLogin = document.getElementById('nav-login');
  const modalClose = document.getElementById('modal-close');
  const btnLogin = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');
  const passwordToggle = document.getElementById('password-toggle');
  const loginPassword = document.getElementById('login-password');
  const loginUsername = document.getElementById('login-username');
  const loginForm = document.getElementById('login-form');

  // 打开弹窗
  if (navLogin && loginModal) {
    navLogin.addEventListener('click', () => {
      loginModal.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  }

  // 关闭弹窗
  function closeModal() {
    loginModal.classList.remove('show');
    document.body.style.overflow = '';
  }

  if (modalClose && loginModal) {
    modalClose.addEventListener('click', closeModal);
    // 点击遮罩关闭
    loginModal.addEventListener('click', (e) => {
      if (e.target === loginModal) closeModal();
    });
  }

  // ESC 关闭
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && loginModal.classList.contains('show')) {
      closeModal();
    }
  });

  // 密码显示/隐藏
  if (passwordToggle && loginPassword) {
    passwordToggle.addEventListener('click', () => {
      const isPassword = loginPassword.type === 'password';
      loginPassword.type = isPassword ? 'text' : 'password';
      passwordToggle.className = isPassword ? 'fas fa-eye-slash form__password-toggle' : 'fas fa-eye form__password-toggle';
    });
  }

  // 基础验证
  function validateLoginForm() {
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();
    if (!username) {
      alert('请输入用户名或邮箱');
      return false;
    }
    if (!password) {
      alert('请输入密码');
      return false;
    }
    if (password.length < 6) {
      alert('密码长度不能少于 6 位');
      return false;
    }
    return true;
  }

  // 登录按钮
  if (btnLogin) {
    btnLogin.addEventListener('click', () => {
      if (validateLoginForm()) {
        alert('该用户无登录权限');
        loginForm.reset();
      }
    });
  }

  // 注册按钮
  if (btnRegister) {
    btnRegister.addEventListener('click', () => {
      if (validateLoginForm()) {
        alert('该用户无注册权限');
        loginForm.reset();
      }
    });
  }

  /* ========== Hero 3D 卡牌轮播 ========== */
  const carouselStage = document.getElementById('hero-carousel-stage');
  const carouselPrev = document.getElementById('hero-carousel-prev');
  const carouselNext = document.getElementById('hero-carousel-next');
  const carouselContainer = document.getElementById('hero-carousel');

  if (carouselStage && carouselPrev && carouselNext) {
    const allCards = Array.from(carouselStage.querySelectorAll('.hero__carousel-card'));
    let visibleCards = allCards.slice();
    let currentIndex = 0;
    let autoPlayTimer = null;
    let isPaused = false;

    const STATES = ['hidden-left', 'prev', 'active', 'next', 'hidden-right'];

    // 应用筛选：按 data-category 过滤可见卡牌
    function applyFilter(filter) {
      visibleCards = filter === 'all'
        ? allCards.slice()
        : allCards.filter(c => c.dataset.category === filter);

      // 标记被筛选隐藏的卡牌
      allCards.forEach(c => {
        c.classList.toggle('filtered-out', !visibleCards.includes(c));
      });

      if (visibleCards.length === 0) return;
      currentIndex = 0;
      updateCarousel(0);
      startAutoPlay();
    }

    function updateCarousel(index) {
      const total = visibleCards.length;
      if (total === 0) return;

      const prevIndex = currentIndex;
      currentIndex = ((index % total) + total) % total;

      // 检测首尾循环：前进时尾→首，后退时首→尾
      const isWrapForward = prevIndex === total - 1 && currentIndex === 0;
      const isWrapBackward = prevIndex === 0 && currentIndex === total - 1;

      // ---- 三相渲染管线，确保 transition:none 在 paint 前生效 ----
      // Phase 1：标记横跨卡片，禁用过渡，强制布局刷新
      const crossingCards = [];

      visibleCards.forEach((card, i) => {
        const offset = i - currentIndex;
        const prevOffset = i - prevIndex;

        const crossesCenter = (isWrapForward && prevOffset < 0 && offset >= 1) ||
                              (isWrapBackward && prevOffset > 0 && offset <= -1);

        if (crossesCenter) {
          card.style.transition = 'none';
          crossingCards.push(card);
        }
      });

      // 强制一次全局布局刷新：确保 transition:none 被浏览器引擎记录
      if (crossingCards.length) {
        void carouselStage.offsetHeight;
      }

      // Phase 2：清空所有卡牌状态，再为可见卡牌分配新状态
      allCards.forEach(card => {
        STATES.forEach(s => card.classList.remove(s));
      });

      visibleCards.forEach((card, i) => {
        const offset = i - currentIndex;

        if (offset === 0) {
          card.classList.add('active');
        } else if (offset === -1 || offset === total - 1) {
          card.classList.add('prev');
        } else if (offset === 1 || offset === -(total - 1)) {
          card.classList.add('next');
        } else if (offset < 0) {
          card.classList.add('hidden-left');
        } else {
          card.classList.add('hidden-right');
        }
      });

      // Phase 3：下一帧恢复过渡，确保当前帧以 transition:none 完成 paint
      if (crossingCards.length) {
        requestAnimationFrame(() => {
          crossingCards.forEach(c => { c.style.transition = ''; });
        });
      }
    }

    function goNext() {
      updateCarousel(currentIndex + 1);
    }

    function goPrev() {
      updateCarousel(currentIndex - 1);
    }

    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(() => {
        if (!isPaused) goNext();
      }, 4000);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    carouselPrev.addEventListener('click', () => {
      goPrev();
      startAutoPlay();
    });

    carouselNext.addEventListener('click', () => {
      goNext();
      startAutoPlay();
    });

    // 鼠标悬停暂停
    if (carouselContainer) {
      carouselContainer.addEventListener('mouseenter', () => { isPaused = true; });
      carouselContainer.addEventListener('mouseleave', () => { isPaused = false; });
    }

    // 触摸滑动支持
    let touchStartX = 0;
    let touchEndX = 0;

    carouselStage.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      isPaused = true;
    }, { passive: true });

    carouselStage.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      isPaused = false;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) goNext();
        else goPrev();
        startAutoPlay();
      }
    });

    // 卡牌点击跳转（事件委托 + 防重复点击）
    let cardClickLocked = false;

    carouselStage.addEventListener('click', (e) => {
      const card = e.target.closest('.hero__carousel-card');
      if (!card) return;

      // 仅 active 卡牌响应点击
      if (!card.classList.contains('active')) return;

      // 防重复点击：300ms 内忽略后续点击
      if (cardClickLocked) return;
      cardClickLocked = true;
      setTimeout(() => { cardClickLocked = false; }, 300);

      const href = card.dataset.href;
      const target = card.dataset.target;

      // 点击反馈动画
      card.classList.add('clicked');
      card.addEventListener('animationend', () => {
        card.classList.remove('clicked');
      }, { once: true });

      // 路由分发
      if (!href) return;

      if (target === 'anchor') {
        // 页面内锚点：先关闭移动端菜单，再平滑滚动
        if (typeof closeMobileMenu === 'function') closeMobileMenu();
        const el = document.querySelector(href);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      } else if (target === 'url') {
        // 外部 / 内部链接
        window.open(href, href.startsWith('http') ? '_blank' : '_self');
      }
    });

    // 筛选按钮：点击后过滤轮播卡牌
    const carouselFilterBtns = document.querySelectorAll('.hero__carousel-filter');
    carouselFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        carouselFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilter(btn.dataset.filter);
      });
    });

    // 初始化
    updateCarousel(0);
    startAutoPlay();
  }

});