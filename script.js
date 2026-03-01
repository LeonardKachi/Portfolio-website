// ==========================================
// PRODUCTION-READY CLOUD SECURITY PORTFOLIO
// Complete JavaScript Module
// ==========================================
// Simple device warning for laptop-only content
document.addEventListener('DOMContentLoaded', function() {
  const laptopButtons = document.querySelectorAll('.laptop-content-btn');
  const modal = document.getElementById('device-warning-modal');
  
  if (!laptopButtons.length || !modal) return;
  
  function isMobile() {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  laptopButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      if (isMobile()) {
        e.preventDefault();
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    });
  });
  
  // Close modal handlers
  const closeBtn = document.querySelector('.device-modal-close');
  const okBtn = document.getElementById('device-modal-ok');
  
  function closeModal() {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
  
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (okBtn) okBtn.addEventListener('click', closeModal);
  
  window.addEventListener('click', function(e) {
    if (e.target === modal) closeModal();
  });
});


'use strict';

// ==========================================
// ANALYTICS & LOGGING SYSTEM
// ==========================================
const Analytics = {
  log(eventType, details) {
    console.log(`[Analytics] ${eventType}:`, details);
  },
  
  trackPageView() {
    this.log('page_view', { path: window.location.pathname, timestamp: Date.now() });
  },
  
  trackInteraction(category, action, label) {
    this.log('interaction', { category, action, label, timestamp: Date.now() });
  }
};

// ==========================================
// MODAL SYSTEM FOR CERTIFICATES & RESUME
// ==========================================
const ModalSystem = (() => {
  function init() {
    // Create modal if it doesn't exist
    if (!document.getElementById('cert-modal')) {
      createModal();
    }
    
    // Setup close events
    setupCloseEvents();
  }
  
  function createModal() {
    const modal = document.createElement('div');
    modal.id = 'cert-modal';
    modal.className = 'cert-modal';
    modal.innerHTML = `
      <div class="modal-content">
        <span class="modal-close" onclick="closeModal()">&times;</span>
        <div id="modal-body"></div>
        <div id="modal-title" class="modal-title"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  function setupCloseEvents() {
    const modal = document.getElementById('cert-modal');
    if (!modal) return;
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeModal();
      }
    });
    
    // Close on outside click
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('cert-modal')) {
        closeModal();
      }
    });
  }
  
  function isMobileDevice() {
    return window.innerWidth <= 768;
  }
  
  function showCertificate(certPath, title, fallbackPng) {
    const modal = document.getElementById('cert-modal');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');
    
    if (!modal || !modalBody) return;
    
    const isMobile = isMobileDevice();
    const pdfPath = `assets/images/cert-badges/${certPath}`;
    const encodedPath = encodeURIComponent(window.location.origin + '/' + pdfPath);
    
    let content = '';
    
    // Special handling for AWS candidate certs
    if (certPath.includes('aws-sa') || certPath.includes('aws-doe')) {
      content = `
        <img src="assets/images/cert-badges/${fallbackPng}" alt="${title}" 
             style="max-width:100%; max-height:60vh; border-radius:8px; border:2px solid var(--accent);">
        <p class="fallback-message" style="color:var(--text-muted); margin-top:1rem;">Certificate PDF coming soon. Showing badge preview.</p>
      `;
    } else {
      if (isMobile) {
        // Mobile: Use Google Docs Viewer for PDFs
        content = `
          <div class="pdf-container">
            <iframe src="https://docs.google.com/viewer?url=${encodedPath}&embedded=true" 
                    frameborder="0" allowfullscreen></iframe>
          </div>
          <a href="${pdfPath}" download class="pdf-download">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Download PDF Certificate
          </a>
        `;
      } else {
        // Desktop: Use embed
        content = `
          <div class="pdf-container">
            <embed src="${pdfPath}" type="application/pdf" />
          </div>
          <a href="${pdfPath}" download class="pdf-download">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Download PDF Certificate
          </a>
        `;
      }
    }
    
    modalBody.innerHTML = content;
    modalTitle.textContent = title;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function showResume(resumePath, title) {
    const modal = document.getElementById('cert-modal');
    const modalBody = document.getElementById('modal-body');
    const modalTitle = document.getElementById('modal-title');
    
    if (!modal || !modalBody) return;
    
    const isMobile = isMobileDevice();
    const encodedPath = encodeURIComponent(window.location.origin + '/' + resumePath);
    
    let content = '';
    
    if (isMobile) {
      content = `
        <div class="pdf-container">
          <iframe src="https://docs.google.com/viewer?url=${encodedPath}&embedded=true" 
                  frameborder="0" allowfullscreen></iframe>
        </div>
        <a href="${resumePath}" download class="pdf-download">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
          Download Resume
        </a>
      `;
    } else {
      content = `
        <div class="pdf-container">
          <embed src="${resumePath}" type="application/pdf" />
        </div>
        <a href="${resumePath}" download class="pdf-download">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
          </svg>
          Download Resume
        </a>
      `;
    }
    
    modalBody.innerHTML = content;
    modalTitle.textContent = title;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeModal() {
    const modal = document.getElementById('cert-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  }
  
  // Expose to global scope
  window.showCertificate = showCertificate;
  window.showResume = showResume;
  window.closeModal = closeModal;
  
  return { init, showCertificate, showResume, closeModal };
})();

// ==========================================
// CERTIFICATIONS DATA & MANAGEMENT
// ==========================================
const CertificationsModule = (() => {
  const certifications = [
    {
      title: "Certified in Cybersecurity",
      issuer: "ISC2",
      year: "2025",
      sortYear: 2025,
      image: "isc2-cc.png",
      certificate: "isc2-cc-cert.pdf",
      category: "security",
      description: "Foundational cybersecurity certification covering security principles, risk management, and incident response."
    },
    {
      title: "Data Analytics",
      issuer: "Google (Coursera)",
      year: "2023",
      sortYear: 2023,
      image: "google-da.jpg",
      certificate: "google-da-cert.pdf",
      category: "data",
      description: "Professional training in data analysis, visualization, and machine learning fundamentals."
    },
    {
      title: "Security+",
      issuer: "CompTIA",
      year: "2025",
      sortYear: 2025,
      image: "security-plus.png",
      certificate: "security-plus-cert.pdf",
      category: "security",
      description: "Global certification validating baseline cybersecurity skills."
    },
    {
      title: "Solutions Architect (Associate)",
      issuer: "AWS",
      year: "Candidate (March 2026)",
      sortYear: 2026,
      image: "aws-sa.png",
      certificate: "aws-sa-cert.pdf",
      category: "aws",
      candidate: true,
      description: "Demonstrates expertise in designing distributed systems on AWS."
    },
    {
      title: "DevOps Engineer (Professional)",
      issuer: "AWS",
      year: "Candidate (2026)",
      sortYear: 2026,
      image: "aws-doe.png",
      certificate: "aws-doe-cert.pdf",
      category: "aws",
      candidate: true,
      description: "Demonstrates expertise in AWS security best practices."
    },
    {
      title: "AI Essentials",
      issuer: "Google",
      year: "2023",
      sortYear: 2023,
      image: "google-ai.jpg",
      certificate: "google-ai-cert.pdf",
      category: "ai",
      description: "Fundamentals of artificial intelligence and machine learning applications."
    },
    {
      title: "Cybersecurity | Ethical Hacking",
      issuer: "Neo Cloud Technologies",
      year: "2024",
      sortYear: 2024,
      image: "neo.jpg",
      certificate: "neo-cert.pdf",
      category: "security",
      description: "Practical training in penetration testing and vulnerability assessment."
    },
    {
      title: "Solutions Architect",
      issuer: "Neo Cloud Technologies",
      year: "2025",
      sortYear: 2025,
      image: "neo.jpg",
      certificate: "neo-sa-cert.pdf",
      category: "aws",
      description: "Practical training in Cloud Environment (AWS, Azure, GCP)."
    },
    {
      title: "Cybersecurity Foundations",
      issuer: "MasterCard",
      year: "2024",
      sortYear: 2024,
      image: "mf.png",
      certificate: "mf-cert.pdf",
      category: "security",
      description: "Core principles of information security and cyber defense strategies."
    }
  ];

  const filterCategories = [
    { id: 'all', label: 'All Certifications' },
    { id: 'security', label: 'Security' },
    { id: 'aws', label: 'AWS' },
    { id: 'data', label: 'Data' },
    { id: 'ai', label: 'AI' }
  ];

  let currentFilter = 'all';
  let currentSort = 'newest'; // Default to newest first

  function init() {
    const filtersContainer = document.getElementById('cert-filters');
    const certGrid = document.querySelector('.cert-grid');
    
    if (!filtersContainer || !certGrid) return;
    
    renderFilters(filtersContainer);
    
    // Sort by newest first by default
    const sortedCerts = sortCertifications(certifications, 'newest');
    renderCerts(sortedCerts, certGrid);
    
    setupEventDelegation();
    setupSortListener();
  }

  function renderFilters(container) {
    container.innerHTML = '';
    filterCategories.forEach((filter, index) => {
      const button = document.createElement('button');
      button.textContent = filter.label;
      button.dataset.filter = filter.id;
      button.classList.add('filter-btn');
      if (index === 0) button.classList.add('active');
      container.appendChild(button);
    });
  }

  function renderCerts(certs, container) {
    if (certs.length === 0) {
      container.innerHTML = '<p class="no-results">No certifications found in this category.</p>';
      return;
    }
    
    container.innerHTML = '';
    
    const fragment = document.createDocumentFragment();
    certs.forEach(cert => {
      const certCard = createCertCard(cert);
      fragment.appendChild(certCard);
    });
    
    container.appendChild(fragment);
  }

  function createCertCard(cert) {
    const card = document.createElement('div');
    card.className = 'cert-card';
    
    // Add click handler for title to show certificate
    const titleHtml = `<h3 onclick="showCertificate('${cert.certificate}', '${cert.title} - ${cert.issuer}', '${cert.image}')">${cert.title}</h3>`;
    
    card.innerHTML = `
      <div class="cert-badge">
        <img src="assets/images/cert-badges/${cert.image}" 
             alt="${cert.issuer} ${cert.title}" 
             loading="lazy"
             onerror="this.src='assets/images/cert-badges/default.png'">
        ${cert.candidate ? '<span class="candidate-badge">In Progress</span>' : ''}
      </div>
      <div class="cert-details">
        ${titleHtml}
        <p class="issuer">${cert.issuer}</p>
        <p class="cert-date">${cert.year}</p>
        <p class="cert-description">${cert.description}</p>
      </div>
    `;
    return card;
  }

  function filterCerts(filter) {
    const certGrid = document.querySelector('.cert-grid');
    if (!certGrid) return;
    
    currentFilter = filter;
    
    certGrid.innerHTML = '<div class="loading-spinner"></div>';
    
    Analytics.trackInteraction('certifications', 'filter', filter);
    
    requestAnimationFrame(() => {
      let filteredCerts = filter === 'all' 
        ? certifications 
        : certifications.filter(cert => cert.category === filter);
      
      // Apply sort
      filteredCerts = sortCertifications(filteredCerts, currentSort);
      
      renderCerts(filteredCerts, certGrid);
    });
  }

  function sortCertifications(certs, sortOrder) {
    return [...certs].sort((a, b) => {
      if (sortOrder === 'newest') {
        return b.sortYear - a.sortYear;
      } else {
        return a.sortYear - b.sortYear;
      }
    });
  }

  function setupSortListener() {
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      // Set default to newest
      sortSelect.value = 'newest';
      
      sortSelect.addEventListener('change', (e) => {
        currentSort = e.target.value;
        filterCerts(currentFilter);
      });
    }
  }

  function setupEventDelegation() {
    document.getElementById('cert-filters')?.addEventListener('click', (e) => {
      if (e.target.matches('.filter-btn')) {
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        filterCerts(e.target.dataset.filter);
      }
    });
  }

  return { init };
})();

// ==========================================
// DEV.TO ARTICLES MODULE
// ==========================================
const DevToArticles = (() => {
  const CACHE_KEY = 'devto-articles';
  const CACHE_DURATION = 600000; // 10 minutes
  const API_URL = 'https://dev.to/api/articles?username=leonardkachi&per_page=8';

  async function init() {
    const feed = document.getElementById('devto-feed');
    if (!feed) return;
    
    showLoadingState(feed);
    
    try {
      const articles = await fetchArticles();
      renderArticles(articles, feed);
    } catch (error) {
      console.error('Error loading Dev.to articles:', error);
      showErrorFallback(feed);
    }
  }

  function showLoadingState(container) {
    container.innerHTML = `
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
      <div class="skeleton-card"></div>
    `;
  }

  async function fetchArticles() {
    const cached = getCache();
    if (cached) return cached;
    
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const articles = await response.json();
    setCache(articles);
    
    return articles;
  }

  function getCache() {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
    }
    return null;
  }

  function setCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        data,
        timestamp: Date.now()
      }));
    } catch (error) {
      console.warn('Cache storage failed:', error);
    }
  }

  function renderArticles(articles, container) {
    if (!articles || articles.length === 0) {
      showErrorFallback(container);
      return;
    }
    
    container.innerHTML = '';
    
    const fragment = document.createDocumentFragment();
    articles.slice(0, 8).forEach(article => {
      const card = createArticleCard(article);
      fragment.appendChild(card);
    });
    
    container.appendChild(fragment);
  }

  function createArticleCard(article) {
    const card = document.createElement('article');
    card.className = 'article-card';
    card.innerHTML = `
      <div class="article-image-container">
        <img src="${article.cover_image || getPlaceholderImage(article.title)}" 
             alt="${article.title}" 
             class="article-image" 
             loading="lazy"
             onerror="this.src='${getPlaceholderImage(article.title)}'">
        <div class="reading-time">${article.reading_time_minutes || 5} min read</div>
      </div>
      <div class="article-content">
        <h3 class="article-title">
          <a href="${article.url}" target="_blank" rel="noopener">${article.title}</a>
        </h3>
        <p class="article-excerpt">${article.description || 'Read more on Dev.to'}</p>
        <div class="article-meta">
          <span>${new Date(article.published_at).toLocaleDateString()}</span>
          <span class="reactions">${article.positive_reactions_count} ♥</span>
        </div>
      </div>
    `;
    return card;
  }

  function getPlaceholderImage(title) {
    const colors = ['1e3d38', '0d1f23', '11232b'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return `https://via.placeholder.com/600x400/${randomColor}/3aafa9?text=${encodeURIComponent(title.substring(0, 30))}`;
  }

  function showErrorFallback(container) {
    const fallbackArticles = [
      {
        title: "AWS Security Best Practices",
        url: "https://dev.to/leonardkachi",
        description: "Comprehensive guide to securing AWS infrastructure with IAM policies, encryption, and monitoring.",
        published_at: new Date().toISOString(),
        positive_reactions_count: 28,
        reading_time_minutes: 5,
        cover_image: getPlaceholderImage("AWS Security")
      },
      {
        title: "Terraform for Security Engineers",
        url: "https://dev.to/leonardkachi",
        description: "Implementing security controls through Infrastructure as Code with Terraform modules.",
        published_at: new Date().toISOString(),
        positive_reactions_count: 34,
        reading_time_minutes: 8,
        cover_image: getPlaceholderImage("Terraform Security")
      },
      {
        title: "Zero Trust on AWS",
        url: "https://dev.to/leonardkachi",
        description: "Implementing Zero Trust architecture principles in AWS cloud environments.",
        published_at: new Date().toISOString(),
        positive_reactions_count: 42,
        reading_time_minutes: 7,
        cover_image: getPlaceholderImage("Zero Trust AWS")
      },
      {
        title: "Cloud Security Automation",
        url: "https://dev.to/leonardkachi",
        description: "Automating security compliance checks using Python and AWS services.",
        published_at: new Date().toISOString(),
        positive_reactions_count: 31,
        reading_time_minutes: 6,
        cover_image: getPlaceholderImage("Cloud Security Automation")
      }
    ];
    
    renderArticles(fallbackArticles, container);
  }

  return { init };
})();

// ==========================================
// EXPANDABLE SKILLS SECTION
// ==========================================
const ExpandableSkills = (() => {
  function init() {
    animateSkillBars();
    setupExpandableSections();
    setupScrollAnimation();
  }
  
  function setupExpandableSections() {
    const expandButtons = document.querySelectorAll('.expand-toggle');
    
    expandButtons.forEach((button, index) => {
      const targetId = button.getAttribute('data-target');
      const content = document.getElementById(targetId);
      const icon = button.querySelector('.toggle-icon');
      
      
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const content = document.getElementById(targetId);
        const icon = this.querySelector('.toggle-icon');
        
        if (!content) return;
        
        const isExpanded = content.classList.contains('expanded');
        
        document.querySelectorAll('.expandable-content').forEach(item => {
          if (item !== content) {
            item.classList.remove('expanded');
            item.style.maxHeight = '0';
            const otherIcon = item.previousElementSibling?.querySelector('.toggle-icon');
            if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
          }
        });
        
        if (isExpanded) {
          content.classList.remove('expanded');
          content.style.maxHeight = '0';
          if (icon) icon.style.transform = 'rotate(0deg)';
        } else {
          content.classList.add('expanded');
          content.style.maxHeight = content.scrollHeight + 'px';
          if (icon) icon.style.transform = 'rotate(180deg)';
        }
      });
    });
  }
  
  function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-level');
    
    skillBars.forEach(bar => {
      const width = bar.getAttribute('data-width') || '0';
      setTimeout(() => {
        bar.style.width = width + '%';
      }, 300);
    });
  }
  
  function setupScrollAnimation() {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateSkillBars();
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    const skillsSection = document.querySelector('.skills-visualization');
    if (skillsSection) {
      observer.observe(skillsSection);
    }
  }
  
  return { init };
})();

// ==========================================
// SECURITY LAB MODULE
// ==========================================
const SecurityLab = (() => {
  const cloudActions = {
    aws: {
      'Amazon S3': [
        's3:GetObject', 's3:PutObject', 's3:DeleteObject', 
        's3:ListBucket', 's3:GetBucketPolicy', 's3:PutBucketPolicy'
      ],
      'Amazon EC2': [
        'ec2:RunInstances', 'ec2:TerminateInstances', 
        'ec2:StartInstances', 'ec2:StopInstances'
      ],
      'AWS IAM': [
        'iam:CreateUser', 'iam:DeleteUser', 'iam:CreateAccessKey',
        'iam:PutUserPolicy', 'iam:AttachUserPolicy'
      ]
    },
    azure: {
      'Azure Storage': [
        'Microsoft.Storage/storageAccounts/blobServices/containers/read',
        'Microsoft.Storage/storageAccounts/blobServices/containers/write'
      ],
      'Azure Compute': [
        'Microsoft.Compute/virtualMachines/read',
        'Microsoft.Compute/virtualMachines/write'
      ]
    },
    gcp: {
      'Google Cloud Storage': [
        'storage.buckets.get',
        'storage.buckets.create'
      ],
      'Compute Engine': [
        'compute.instances.get',
        'compute.instances.create'
      ]
    }
  };

  const attackPatterns = {
    'data-exfiltration': {
      name: "Data Exfiltration",
      description: "Attempts to copy sensitive data to an external location",
      steps: [
        "Scanning for S3 buckets with misconfigured permissions",
        "Attempting to list bucket contents using s3:ListBucket",
        "Downloading sensitive files with s3:GetObject",
        "Uploading data to external server using s3:PutObject"
      ],
      prevention: [
        "Implement least privilege access for S3 buckets",
        "Enable S3 bucket logging and monitoring",
        "Use bucket policies to restrict access by IP",
        "Encrypt sensitive data at rest with KMS"
      ]
    },
    'privilege-escalation': {
      name: "Privilege Escalation",
      description: "Attempts to gain higher level permissions in the cloud environment",
      steps: [
        "Listing IAM policies to identify overly permissive ones",
        "Creating new IAM user with excessive permissions",
        "Attaching admin policy to compromised user",
        "Creating access keys for persistent access"
      ],
      prevention: [
        "Require MFA for sensitive IAM actions",
        "Implement permission boundaries for all users",
        "Monitor CloudTrail for unusual IAM activity",
        "Regularly review and rotate IAM policies"
      ]
    },
    'cryptomining': {
      name: "Cryptomining Attack",
      description: "Unauthorized use of cloud resources for cryptocurrency mining",
      steps: [
        "Compromising EC2 instance credentials",
        "Launching high-CPU instances",
        "Installing mining software",
        "Connecting to mining pool"
      ],
      prevention: [
        "Set up billing alerts for unusual resource usage",
        "Monitor CloudWatch for CPU spikes",
        "Implement instance launch restrictions",
        "Use AWS Budgets for cost anomaly detection"
      ]
    },
    'denial-of-service': {
      name: "Denial of Service",
      description: "Overwhelming resources to make services unavailable",
      steps: [
        "Identifying public-facing endpoints",
        "Launching distributed attack from multiple IPs",
        "Exhausting connection limits",
        "Consuming all available bandwidth"
      ],
      prevention: [
        "Implement AWS Shield for DDoS protection",
        "Use CloudFront with WAF rules",
        "Set up auto-scaling for resilience",
        "Configure rate limiting on API Gateway"
      ]
    }
  };

  const policyTemplates = {
    's3-readonly': {
      name: "S3 Read Only Access",
      description: "Provides read-only access to specific S3 buckets",
      policy: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:Get*",
        "s3:List*"
      ],
      "Resource": [
        "arn:aws:s3:::example-bucket",
        "arn:aws:s3:::example-bucket/*"
      ]
    }
  ]
}`
    },
    'ec2-full': {
      name: "EC2 Full Access",
      description: "Complete control over EC2 instances",
      policy: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ec2:*",
      "Resource": "*"
    }
  ]
}`
    },
    'least-privilege': {
      name: "Least Privilege EC2 Access",
      description: "Restricted EC2 access with environment tagging",
      policy: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:Describe*",
        "ec2:StartInstances",
        "ec2:StopInstances"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "ec2:ResourceTag/Environment": "development"
        }
      }
    }
  ]
}`
    },
    'admin-access': {
      name: "Administrator Access",
      description: "Full access to all AWS services (use with caution)",
      policy: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "*",
      "Resource": "*"
    }
  ]
}`
    }
  };

  function init() {
    initScenarioSwitcher();
    initIAMSimulator();
    initAttackSimulator();
    initPolicyRecommender();
    initNetworkVisualizer();
  }

  function initScenarioSwitcher() {
    const scenarioButtons = document.querySelectorAll('.scenario-btn');
    if (!scenarioButtons.length) return;
    
    scenarioButtons.forEach(btn => {
      btn.addEventListener('click', function() {
        document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const scenario = this.dataset.scenario;
        document.querySelectorAll('.scenario-content').forEach(content => {
          content.classList.remove('active');
        });
        
        const targetScenario = document.getElementById(`${scenario}-scenario`);
        if (targetScenario) {
          targetScenario.classList.add('active');
        }
        
        Analytics.trackInteraction('security_lab', 'scenario_switch', scenario);
      });
    });
  }

  function initIAMSimulator() {
    const cloudProvider = document.getElementById('cloud-provider');
    const testButton = document.getElementById('test-policy-btn');
    const actionPresets = document.getElementById('action-presets');
    
    if (cloudProvider) {
      cloudProvider.addEventListener('change', updateActionList);
      updateActionList();
    }
    
    if (testButton) {
      testButton.addEventListener('click', testPolicy);
    }
    
    if (actionPresets) {
      actionPresets.addEventListener('change', loadPolicyTemplate);
    }
  }

  function updateActionList() {
    const provider = document.getElementById('cloud-provider')?.value;
    const container = document.getElementById('action-list-container');
    if (!container || !provider || !cloudActions[provider]) return;
    
    container.innerHTML = '';
    
    const fragment = document.createDocumentFragment();
    Object.entries(cloudActions[provider]).forEach(([service, actions]) => {
      const serviceGroup = document.createElement('div');
      serviceGroup.className = 'action-group';
      serviceGroup.innerHTML = `<h5>${service}</h5>`;
      
      actions.forEach(action => {
        const actionId = action.replace(/[:.]/g, '-');
        const label = document.createElement('label');
        label.innerHTML = `
          <input type="checkbox" name="action" id="${actionId}" value="${action}">
          ${action}
        `;
        serviceGroup.appendChild(label);
      });
      
      fragment.appendChild(serviceGroup);
    });
    
    container.appendChild(fragment);
  }

  function loadPolicyTemplate(e) {
    const template = policyTemplates[e.target.value];
    const policyInput = document.getElementById('policy-input');
    if (template && policyInput) {
      policyInput.value = template.policy;
    }
  }

  function testPolicy() {
    const policyInput = document.getElementById('policy-input');
    const resultsPanel = document.getElementById('policy-results');
    
    try {
      const policy = JSON.parse(policyInput.value);
      const selectedActions = Array.from(
        document.querySelectorAll('input[name="action"]:checked')
      ).map(el => el.value);
      
      if (selectedActions.length === 0) {
        showResultError('Please select at least one action to test', resultsPanel);
        return;
      }
      
      const results = evaluatePolicy(policy, selectedActions);
      renderPolicyResults(results, resultsPanel);
      
      Analytics.trackInteraction('security_lab', 'policy_test', `${selectedActions.length}_actions`);
    } catch (error) {
      showResultError(`Invalid policy: ${error.message}`, resultsPanel);
    }
  }

  function evaluatePolicy(policy, actions) {
    const results = [];
    const validation = validatePolicy(policy);
    
    actions.forEach(action => {
      const result = {
        action,
        allowed: false,
        reason: 'No matching Allow statement found',
        denyReason: ''
      };
      
      const denyStatement = policy.Statement.find(s => 
        s.Effect === 'Deny' && matchesAction(s.Action, action)
      );
      
      if (denyStatement) {
        result.allowed = false;
        result.denyReason = 'Explicitly denied by policy';
        results.push(result);
        return;
      }
      
      const allowStatement = policy.Statement.find(s => 
        s.Effect === 'Allow' && matchesAction(s.Action, action)
      );
      
      if (allowStatement) {
        result.allowed = true;
        result.reason = 'Allowed by policy';
      }
      
      results.push(result);
    });
    
    return { actionResults: results, validation };
  }

  function matchesAction(policyActions, testAction) {
    if (typeof policyActions === 'string') {
      policyActions = [policyActions];
    }
    
    return policyActions.some(policyAction => {
      if (policyAction === testAction) return true;
      if (policyAction === '*') return true;
      
      const [service, permission] = testAction.split(':');
      if (policyAction === `${service}:*`) return true;
      
      if (policyAction.includes('*')) {
        const [policyService, policyPermission] = policyAction.split(':');
        if (service === policyService && 
            permission.startsWith(policyPermission.replace('*', ''))) {
          return true;
        }
      }
      
      return false;
    });
  }

  function validatePolicy(policy) {
    const issues = [];
    
    if (!policy.Version) {
      issues.push('Policy is missing Version field');
    }
    
    if (!policy.Statement || !Array.isArray(policy.Statement)) {
      issues.push('Policy must contain a Statement array');
    } else if (policy.Statement.length === 0) {
      issues.push('Policy must contain at least one Statement');
    } else {
      policy.Statement.forEach((stmt, i) => {
        if (!stmt.Effect) {
          issues.push(`Statement ${i+1}: Missing Effect (must be "Allow" or "Deny")`);
        }
        
        if (!stmt.Action || (Array.isArray(stmt.Action) && stmt.Action.length === 0)) {
          issues.push(`Statement ${i+1}: No actions specified`);
        }
        
        if (stmt.Resource === '*') {
          issues.push(`Statement ${i+1}: Using wildcard (*) resource may be overly permissive`);
        }
      });
    }
    
    return issues;
  }

  function renderPolicyResults({ actionResults, validation }, container) {
    if (!container) return;
    
    container.innerHTML = '<h4>Policy Evaluation Results</h4>';
    
    const fragment = document.createDocumentFragment();
    
    actionResults.forEach(result => {
      const resultItem = document.createElement('div');
      resultItem.className = `result-item ${result.allowed ? 'allowed' : 'denied'}`;
      resultItem.innerHTML = `
        <div class="result-action">
          <strong>${result.action}</strong>
          <span class="result-status">
            ${result.allowed ? '✅ Allowed' : '❌ Denied'}
          </span>
        </div>
        <div class="result-reason ${result.denyReason ? 'deny' : ''}">
          ${result.denyReason || result.reason}
        </div>
      `;
      fragment.appendChild(resultItem);
    });
    
    if (validation.length > 0) {
      const validationSection = document.createElement('div');
      validationSection.innerHTML = '<h4 style="margin-top: 1rem">Policy Validation Issues</h4>';
      validation.forEach(issue => {
        const issueItem = document.createElement('div');
        issueItem.className = 'validation-issue';
        issueItem.textContent = issue;
        validationSection.appendChild(issueItem);
      });
      fragment.appendChild(validationSection);
    }
    
    container.appendChild(fragment);
  }

  function showResultError(message, container) {
    if (!container) return;
    
    container.innerHTML = `
      <div class="error-message">
        <h4>Error</h4>
        <p>${message}</p>
      </div>
    `;
  }

  function initAttackSimulator() {
    const attackType = document.getElementById('attack-type');
    const startBtn = document.getElementById('start-attack');
    const stopBtn = document.getElementById('stop-attack');
    const attackLog = document.getElementById('attack-log');
    let attackInterval;
    
    if (!attackType || !startBtn || !stopBtn || !attackLog) return;
    
    attackLog.innerHTML = '<p class="info-message">Select an attack scenario to begin simulation</p>';
    
    attackType.addEventListener('change', updateAttackDetails);
    startBtn.addEventListener('click', startAttack);
    stopBtn.addEventListener('click', stopAttack);
    
    function updateAttackDetails() {
      const attackId = attackType.value;
      
      if (!attackId) {
        attackLog.innerHTML = '<p class="info-message">Select an attack scenario to begin simulation</p>';
        return;
      }
      
      const attack = attackPatterns[attackId];
      if (!attack) return;
      
      attackLog.innerHTML = `
        <h4>${attack.name}</h4>
        <p class="attack-description">${attack.description}</p>
        
        <div class="attack-section">
          <h5>Attack Steps:</h5>
          <ol class="attack-steps">
            ${attack.steps.map(step => `<li>${step}</li>`).join('')}
          </ol>
        </div>
        
        <div class="attack-section prevention">
          <h5>Prevention Measures:</h5>
          <ul class="prevention-measures">
            ${attack.prevention.map(measure => `<li>${measure}</li>`).join('')}
          </ul>
        </div>
      `;
    }
    
    function startAttack() {
      const attackId = attackType.value;
      
      if (!attackId) {
        alert('Please select an attack scenario first');
        return;
      }
      
      const attack = attackPatterns[attackId];
      let step = 0;
      
      startBtn.disabled = true;
      stopBtn.disabled = false;
      attackType.disabled = true;
      
      attackLog.innerHTML = `<div class="simulation-start">Starting simulation: ${attack.name}</div>`;
      
      Analytics.trackInteraction('security_lab', 'attack_start', attackId);
      
      attackInterval = setInterval(() => {
        if (step < attack.steps.length) {
          const stepElement = document.createElement('div');
          stepElement.className = 'attack-step';
          stepElement.innerHTML = `
            <div class="step-number">Step ${step + 1}</div>
            <div class="step-description">${attack.steps[step]}</div>
          `;
          attackLog.appendChild(stepElement);
          step++;
          attackLog.scrollTop = attackLog.scrollHeight;
        } else {
          clearInterval(attackInterval);
          attackLog.innerHTML += '<div class="simulation-end">Attack simulation completed</div>';
          resetControls();
        }
      }, 2000);
    }
    
    function stopAttack() {
      clearInterval(attackInterval);
      attackLog.innerHTML += '<div class="simulation-stop">Simulation stopped by user</div>';
      resetControls();
      attackLog.scrollTop = attackLog.scrollHeight;
    }
    
    function resetControls() {
      startBtn.disabled = false;
      stopBtn.disabled = true;
      attackType.disabled = false;
    }
  }

  function initPolicyRecommender() {
    const recommendBtn = document.getElementById('recommend-policy');
    const policyInput = document.getElementById('policy-input');
    const resultsPanel = document.getElementById('policy-results');
    
    if (!recommendBtn) return;
    
    recommendBtn.addEventListener('click', () => {
      if (!resultsPanel) return;
      
      resultsPanel.innerHTML = `
        <h4>Recommended Policy Templates</h4>
        <p class="recommendation-intro">
          Select a template below to apply it to the policy editor:
        </p>
      `;
      
      Object.entries(policyTemplates).forEach(([id, template]) => {
        const recommendation = document.createElement('div');
        recommendation.className = 'recommendation-item';
        recommendation.innerHTML = `
          <h5>${template.name}</h5>
          <p class="recommendation-description">${template.description}</p>
          <pre>${template.policy}</pre>
          <button class="btn-outline apply-policy" data-policy='${JSON.stringify(template.policy)}'>
            Apply This Policy
          </button>
        `;
        resultsPanel.appendChild(recommendation);
      });
      
      resultsPanel.querySelectorAll('.apply-policy').forEach(btn => {
        btn.addEventListener('click', (e) => {
          if (policyInput) {
            policyInput.value = JSON.parse(e.target.dataset.policy);
            resultsPanel.innerHTML = '<div class="applied-notice">Policy template applied to editor</div>';
          }
        });
      });
    });
  }

  function initNetworkVisualizer() {
    const networkViz = document.querySelector('.network-visualization');
    if (!networkViz) return;
    
    const securityGroups = {
      'WebServerSG': {
        description: 'Security group for web servers',
        inbound: [
          { protocol: 'TCP', port: '80', source: '0.0.0.0/0', description: 'HTTP access' },
          { protocol: 'TCP', port: '443', source: '0.0.0.0/0', description: 'HTTPS access' },
          { protocol: 'TCP', port: '22', source: '203.0.113.0/24', description: 'SSH from admin network' }
        ],
        outbound: [
          { protocol: 'All', port: 'All', destination: '0.0.0.0/0', description: 'Allow all outbound' }
        ]
      },
      'AppServerSG': {
        description: 'Security group for application servers',
        inbound: [
          { protocol: 'TCP', port: '8080', source: 'WebServerSG', description: 'App traffic from web servers' },
          { protocol: 'TCP', port: '22', source: '203.0.113.0/24', description: 'SSH from admin network' }
        ],
        outbound: [
          { protocol: 'TCP', port: '3306', destination: 'DBServerSG', description: 'Database access' },
          { protocol: 'TCP', port: '443', destination: '0.0.0.0/0', description: 'External API access' }
        ]
      },
      'DBServerSG': {
        description: 'Security group for database servers',
        inbound: [
          { protocol: 'TCP', port: '3306', source: 'AppServerSG', description: 'MySQL from app servers' },
          { protocol: 'TCP', port: '22', source: '203.0.113.0/24', description: 'SSH from admin network' }
        ],
        outbound: [
          { protocol: 'None', port: 'None', destination: 'None', description: 'No outbound access' }
        ]
      }
    };

    networkViz.querySelectorAll('.instance').forEach(instance => {
      instance.addEventListener('mouseenter', function() {
        this.classList.add('highlight');
      });
      
      instance.addEventListener('mouseleave', function() {
        this.classList.remove('highlight');
      });
      
      instance.addEventListener('click', function() {
        const sgName = this.dataset.sg;
        if (sgName && securityGroups[sgName]) {
          showSecurityGroupDetails(sgName, securityGroups);
        }
      });
    });

    function showSecurityGroupDetails(sgName, securityGroups) {
      const sg = securityGroups[sgName];
      const detailsContainer = document.getElementById('sg-details');
      
      if (!sg || !detailsContainer) return;
      
      detailsContainer.innerHTML = `
        <h5>${sgName} - ${sg.description}</h5>
        
        <div class="sg-section">
          <h6>Inbound Rules</h6>
          <table class="sg-rules">
            <thead>
              <tr>
                <th>Protocol</th>
                <th>Port</th>
                <th>Source</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${sg.inbound.map(rule => `
                <tr>
                  <td>${rule.protocol}</td>
                  <td>${rule.port}</td>
                  <td>${rule.source}</td>
                  <td>${rule.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="sg-section">
          <h6>Outbound Rules</h6>
          <table class="sg-rules">
            <thead>
              <tr>
                <th>Protocol</th>
                <th>Port</th>
                <th>Destination</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${sg.outbound.map(rule => `
                <tr>
                  <td>${rule.protocol}</td>
                  <td>${rule.port}</td>
                  <td>${rule.destination}</td>
                  <td>${rule.description}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        <div class="sg-best-practices">
          <h6>Best Practices Applied</h6>
          <ul>
            <li>Least privilege access</li>
            <li>Specific port ranges</li>
            <li>Restricted source IPs where possible</li>
            <li>No open ICMP rules</li>
            <li>No unrestricted outbound access (except for web servers)</li>
          </ul>
        </div>
      `;
    }
  }

  return { init };
})();

// ==========================================
// CONTACT FORM MODULE
// ==========================================
const ContactForm = (() => {
  const FORM_ENDPOINTS = {
    primary: 'https://formspree.io/f/mvgvkvwj',
    fallback: 'https://formsubmit.co/ajax/Kachi.Henry.Leo@gmail.com'
  };
  
  const TIMEOUT_DURATION = 3000;

  function init() {
    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn?.querySelector('.btn-text');
    const spinner = submitBtn?.querySelector('.spinner');
    const formStatus = document.getElementById('form-status');
    const successMessage = document.getElementById('success-message');
    const newMessageBtn = document.getElementById('new-message-btn');
    const contactContainer = document.querySelector('.contact-container');
    const contactInfo = document.querySelector('.contact-info');

    if (!form) return;

    function validateForm() {
      let isValid = true;
      const formGroups = form.querySelectorAll('.form-group');

      formGroups.forEach(group => {
        const input = group.querySelector('input, select, textarea');
        const errorMsg = group.querySelector('.error-message');
        
        group.classList.remove('error');
        if (errorMsg) errorMsg.textContent = '';

        if (!input.value.trim()) {
          group.classList.add('error');
          if (errorMsg) errorMsg.textContent = 'This field is required';
          isValid = false;
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
          group.classList.add('error');
          if (errorMsg) errorMsg.textContent = 'Please enter a valid email';
          isValid = false;
        }
      });

      return isValid;
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateForm()) return;

      if (submitBtn) {
        submitBtn.disabled = true;
        if (btnText) btnText.textContent = 'Sending...';
        if (spinner) spinner.classList.remove('hidden');
      }
      if (formStatus) formStatus.classList.add('hidden');

      const formData = new FormData(form);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), TIMEOUT_DURATION);
      });

      try {
        const submitPromise = submitToEndpoint(formData, FORM_ENDPOINTS.primary);
        await Promise.race([submitPromise, timeoutPromise]);
        showSuccessMessage();
        Analytics.trackInteraction('contact', 'form_submit', 'success');
      } catch (error) {
        if (error.message === 'timeout') {
          showSuccessMessage(true);
          Analytics.trackInteraction('contact', 'form_submit', 'timeout_success');
        } else {
          try {
            await submitToEndpoint(formData, FORM_ENDPOINTS.fallback);
            showSuccessMessage();
            Analytics.trackInteraction('contact', 'form_submit', 'fallback_success');
          } catch (fallbackError) {
            showError();
            Analytics.trackInteraction('contact', 'form_submit', 'error');
          }
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          if (btnText) btnText.textContent = 'Send Message';
          if (spinner) spinner.classList.add('hidden');
        }
      }
    });

    async function submitToEndpoint(formData, endpoint) {
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message')
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return response;
    }

    function showSuccessMessage(isOptimistic = false) {
      if (contactContainer) {
        contactContainer.style.gridTemplateColumns = '1fr';
      }
      if (form) form.style.display = 'none';
      if (contactInfo) contactInfo.style.display = 'none';
      if (successMessage) {
        successMessage.classList.remove('hidden');
        successMessage.style.display = 'block';
        if (isOptimistic) {
          const successText = successMessage.querySelector('p');
          if (successText) {
            successText.textContent = "Your message is being sent. I'll respond within 24 hours.";
          }
        }
      }
    }

    function showError() {
      if (formStatus) {
        formStatus.textContent = 'Unable to send message. Please email me directly at Kachi.Henry.Leo@gmail.com';
        formStatus.classList.remove('hidden');
        formStatus.classList.add('error');
        formStatus.style.display = 'block';
      }
    }

    if (newMessageBtn) {
      newMessageBtn.addEventListener('click', () => {
        if (form) form.reset();
        if (contactContainer) contactContainer.style.gridTemplateColumns = '';
        if (form) form.style.display = 'block';
        if (contactInfo) contactInfo.style.display = 'block';
        if (successMessage) {
          successMessage.classList.add('hidden');
          successMessage.style.display = 'none';
          const successText = successMessage.querySelector('p');
          if (successText) {
            successText.textContent = "Thank you for reaching out. I'll respond within 24 hours.";
          }
        }
        if (formStatus) formStatus.classList.add('hidden');
      });
    }

    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('blur', () => {
        const formGroup = input.closest('.form-group');
        const errorMsg = formGroup?.querySelector('.error-message');
        
        formGroup?.classList.remove('error');
        if (errorMsg) errorMsg.textContent = '';

        if (!input.value.trim()) {
          formGroup?.classList.add('error');
          if (errorMsg) errorMsg.textContent = 'This field is required';
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
          formGroup?.classList.add('error');
          if (errorMsg) errorMsg.textContent = 'Please enter a valid email';
        }
      });
    });
  }

  return { init };
})();

// ==========================================
// MOBILE NAVIGATION
// ==========================================
const MobileNav = (() => {
  function init() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (!hamburger || !navLinks) return;
    
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('active');
    });
    
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  return { init };
})();

// ==========================================
// ZERO TRUST PRINCIPLES SCROLL
// ==========================================
const ZeroTrustScroll = (() => {
  function init() {
    const leftBtn = document.querySelector('.left-scroll');
    const rightBtn = document.querySelector('.right-scroll');
    const principlesGrid = document.querySelector('.principles-grid');
    
    if (!leftBtn || !rightBtn || !principlesGrid) return;
    
    leftBtn.addEventListener('click', () => {
      principlesGrid.scrollBy({ left: -300, behavior: 'smooth' });
    });
    
    rightBtn.addEventListener('click', () => {
      principlesGrid.scrollBy({ left: 300, behavior: 'smooth' });
    });
  }

  return { init };
})();

// ==========================================
// NAVBAR SCROLL EFFECT
// ==========================================
const NavbarScroll = (() => {
  function init() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    let ticking = false;
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          navbar.classList.toggle('scrolled', window.scrollY > 50);
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  return { init };
})();

// ==========================================
// RESUME SECTION
// ==========================================
const ResumeModule = (() => {
  function init() {
    const viewResumeBtn = document.getElementById('view-resume-btn');
    if (viewResumeBtn) {
      viewResumeBtn.addEventListener('click', () => {
        ModalSystem.showResume('resources/Resume.pdf', 'Leonard Kachi - Professional Resume');
      });
    }
  }
  
  return { init };
})();

// ==========================================
// MAIN INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  Analytics.trackPageView();
  
  ModalSystem.init();
  CertificationsModule.init();
  DevToArticles.init();
  SecurityLab.init();
  ContactForm.init();
  MobileNav.init();
  ZeroTrustScroll.init();
  NavbarScroll.init();
  ExpandableSkills.init();
  ResumeModule.init();
  
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
  
  console.log('✅ Portfolio initialized successfully');
});

