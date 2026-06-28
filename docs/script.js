/**
 * MyCakeShop Documentation Interactive Scripts
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const body = document.body;
  const themeToggleBtn = document.getElementById('theme-toggle');
  const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
  const sidebar = document.querySelector('.sidebar');
  const searchInput = document.getElementById('search-docs');
  const navLinks = document.querySelectorAll('.nav-link');
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const faqQuestions = document.querySelectorAll('.faq-question');
  const copyButtons = document.querySelectorAll('.copy-btn');
  const headerTitle = document.querySelector('.header-title');
  const sections = document.querySelectorAll('section.doc-section');

  // --- Theme Toggle Logic ---
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    body.classList.add('dark');
  }

  themeToggleBtn.addEventListener('click', () => {
    body.classList.toggle('dark');
    const isDark = body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Smooth micro-animation for theme switch feedback
    themeToggleBtn.style.transform = 'scale(0.9)';
    setTimeout(() => {
      themeToggleBtn.style.transform = 'scale(1)';
    }, 150);
  });

  // --- Mobile Menu Toggle ---
  mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    sidebar.classList.toggle('open');
  });

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== mobileMenuBtn) {
      sidebar.classList.remove('open');
    }
  });

  // Close sidebar on menu item click (mobile)
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 992) {
        sidebar.classList.remove('open');
      }
    });
  });

  // --- Search Filtering ---
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    navLinks.forEach(link => {
      const text = link.textContent.toLowerCase();
      const parentLi = link.parentElement;
      
      if (text.includes(query)) {
        parentLi.style.display = 'block';
      } else {
        parentLi.style.display = 'none';
      }
    });

    // Hide section headers if all children are hidden
    const navSections = document.querySelectorAll('.sidebar-nav > div');
    navSections.forEach(section => {
      const title = section.querySelector('.nav-section-title');
      const items = section.querySelectorAll('li');
      let hasVisibleItem = false;
      
      items.forEach(item => {
        if (item.style.display !== 'none') {
          hasVisibleItem = true;
        }
      });

      if (title) {
        title.style.display = hasVisibleItem ? 'block' : 'none';
      }
    });
  });

  // --- Setup Guide Tab Switching ---
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      btn.classList.add('active');
      document.getElementById(`${targetTab}-setup`).classList.add('active');
    });
  });

  // --- Accordion FAQ Logic ---
  faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
      const faqItem = question.parentElement;
      const answer = faqItem.querySelector('.faq-answer');
      const isActive = faqItem.classList.contains('active');

      // Close all other FAQ items for a clean accordion effect
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
        item.querySelector('.faq-answer').style.maxHeight = null;
      });

      if (!isActive) {
        faqItem.classList.add('active');
        // Calculate exact scroll height for smooth dynamic opening
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // --- Copy-to-Clipboard ---
  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const wrapper = btn.closest('.code-block-wrapper');
      const code = wrapper.querySelector('code.command-block').textContent;
      
      try {
        await navigator.clipboard.writeText(code);
        
        // Visual feedback update
        const originalText = btn.innerHTML;
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17l-5-5"/></svg>
          Tersalin!
        `;
        btn.style.color = 'var(--brand-tertiary)';
        
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.color = '';
        }, 2000);
      } catch (err) {
        console.error('Gagal menyalin teks: ', err);
      }
    });
  });

  // --- ScrollSpy & Dynamic Header Title ---
  const scrollspyOptions = {
    root: null,
    rootMargin: '-20% 0px -60% 0px', // Trigger when section is in the middle of viewport
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        
        // Update active link in sidebar
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
            
            // Set dynamic header title to the current section's text
            const sectionTitleText = entry.target.querySelector('h2')?.textContent || 'Dokumentasi MyCakeShop';
            headerTitle.textContent = sectionTitleText;
            headerTitle.classList.add('show');
          }
        });

        // Hide title if we are back at the top hero section
        if (id === 'overview') {
          headerTitle.classList.remove('show');
        }
      }
    });
  }, scrollspyOptions);

  sections.forEach(section => {
    observer.observe(section);
  });
});
