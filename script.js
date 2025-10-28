// ==========================================
// PRODUCTION-READY CLOUD SECURITY PORTFOLIO
// Complete JavaScript Module
// ==========================================

'use strict';

// ==========================================
// ANALYTICS & LOGGING SYSTEM
// ==========================================
const Analytics = {
  log(eventType, details) {
    console.log(`[Analytics] ${eventType}:`, details);
    // Future: send to analytics endpoint
    // fetch('/api/analytics', { method: 'POST', body: JSON.stringify({ eventType, details }) });
  },
  
  trackPageView() {
    this.log('page_view', { path: window.location.pathname, timestamp: Date.now() });
  },
  
  trackInteraction(category, action, label) {
    this.log('interaction', { category, action, label, timestamp: Date.now() });
  }
};

// ==========================================
// CERTIFICATIONS DATA & MANAGEMENT
// ==========================================
const CertificationsModule = (() => {
  const certifications = [
    {
      title: "Certified in Cybersecurity",
      issuer: "ISC2",
      year: "2025",
      image: "isc2-cc.png",
      category: "security",
      description: "Foundational cybersecurity certification covering security principles, risk management, and incident response."
    },
    {
      title: "Data Analytics",
      issuer: "Google",
      year: "2024",
      image: "google-da.jpg",
      category: "data",
      description: "Professional training in data analysis, visualization, and machine learning fundamentals."
    },
    {
      title: "Security+",
      issuer: "CompTIA",
      year: "Candidate (2025)",
      image: "security-plus.png",
      category: "security",
      candidate: true,
      description: "Global certification validating baseline cybersecurity skills."
    },
    {
      title: "Solutions Architect",
      issuer: "AWS",
      year: "Candidate (2025)",
      image: "aws-sa.png",
      category: "aws",
      candidate: true,
      description: "Demonstrates expertise in designing distributed systems on AWS."
    },
    {
      title: "Security",
      issuer: "AWS",
      year: "Candidate (2025)",
      image: "aws-ss.png",
      category: "aws",
      candidate: true,
      description: "Demonstrates expertise in AWS security best practices."
    },
    {
      title: "AI Essentials",
      issuer: "Google",
      year: "2024",
      image: "google-ai.jpg",
      category: "ai",
      description: "Fundamentals of artificial intelligence and machine learning applications."
    },
    {
      title: "Cybersecurity | Ethical Hacking",
      issuer: "Neo Cloud Technologies",
      year: "2024",
      image: "neo.jpg",
      category: "security",
      description: "Practical training in penetration testing and vulnerability assessment."
    },
    {
      title: "Solutions Architect",
      issuer: "Neo Cloud Technologies",
      year: "2024",
      image: "neo.jpg",
      category: "aws",
      description: "Practical training in Cloud Environment (AWS, Azure, GCP)."
    },
    {
      title: "Cybersecurity Foundations",
      issuer: "MasterCard",
      year: "2024",
      image: "mf.png",
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

  function init() {
    const filtersContainer = document.getElementById('cert-filters');
    const certGrid = document.querySelector('.cert-grid');
    
    if (!filtersContainer || !certGrid) return;
    
    renderFilters(filtersContainer);
    renderCerts(certifications, certGrid);
    setupEventDelegation();
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
    card.innerHTML = `
      <div class="cert-badge">
        <img src="assets/images/cert-badges/${cert.image}" 
             alt="${cert.issuer} ${cert.title}" 
             loading="lazy"
             onerror="this.src='assets/images/cert-badges/default.png'">
        ${cert.candidate ? '<span class="candidate-badge">In Progress</span>' : ''}
      </div>
      <div class="cert-details">
        <h3>${cert.title}</h3>
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
    
    certGrid.innerHTML = '<div class="loading-spinner"></div>';
    
    Analytics.trackInteraction('certifications', 'filter', filter);
    
    requestAnimationFrame(() => {
      const filteredCerts = filter === 'all' 
        ? certifications 
        : certifications.filter(cert => cert.category === filter);
      
      renderCerts(filteredCerts, certGrid);
    });
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
  const API_URL = 'https://dev.to/api/articles?username=leonardkachi&per_page=6';

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
    articles.forEach(article => {
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
      }
    ];
    
    renderArticles(fallbackArticles, container);
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
    document.querySelector('.lab-container')?.addEventListener('click', (e) => {
      if (e.target.matches('.scenario-btn')) {
        document.querySelectorAll('.scenario-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        
        const scenario = e.target.dataset.scenario;
        document.querySelectorAll('.scenario-content').forEach(content => {
          content.classList.remove('active');
        });
        document.getElementById(`${scenario}-scenario`)?.classList.add('active');
        
        Analytics.trackInteraction('security_lab', 'scenario_switch', scenario);
      }
    });
  }

  function initIAMSimulator() {
    const cloudProvider = document.getElementById('cloud-provider');
    const testButton = document.getElementById('test-policy-btn');
    const actionPresets = document.getElementById('action-presets');
    
    if (!cloudProvider) return;
    
    cloudProvider.addEventListener('change', updateActionList);
    updateActionList();
    
    testButton?.addEventListener('click', testPolicy);
    actionPresets?.addEventListener('change', loadPolicyTemplate);
  }

  function updateActionList() {
    const provider = document.getElementById('cloud-provider')?.value;
    const container = document.getElementById('action-list-container');
    if (!container || !provider) return;
    
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
      
      // Event delegation for apply buttons
      resultsPanel.querySelectorAll('.apply-policy').forEach(btn => {
        btn.addEventListener('click', (e) => {
          policyInput.value = JSON.parse(e.target.dataset.policy);
          resultsPanel.innerHTML = '<div class="applied-notice">Policy template applied to editor</div>';
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

    networkViz.innerHTML = `
      <div class="network-diagram-container">
        <div class="network-diagram">
          <div class="vpc">
            <h4>VPC Architecture</h4>
            <div class="subnets">
              <div class="subnet public-subnet">
                <h5>Public Subnet</h5>
                <div class="instance web-server" data-sg="WebServerSG">
                  <span>Web Server</span>
                </div>
                <div class="instance nat">
                  <span>NAT Gateway</span>
                </div>
              </div>
              <div class="subnet private-subnet">
                <h5>Private Subnet</h5>
                <div class="instance app-server" data-sg="AppServerSG">
                  <span>App Server</span>
                </div>
                <div class="instance db-server" data-sg="DBServerSG">
                  <span>Database</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="security-details-panel">
          <h4>Security Group Details</h4>
          <div id="sg-details">
            <p>Click on an instance to view its security group rules</p>
          </div>
        </div>
      </div>
      <div class="network-controls">
        <button class="btn-outline" id="show-sg-btn">Show Security Groups</button>
      </div>
    `;

    // Setup event listeners for instances
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
// CONTACT FORM MODULE - OPTIMIZED VERSION
// ==========================================
const ContactForm = (() => {
  const FORM_ENDPOINTS = {
    primary: 'https://formspree.io/f/xldwoanq',
    fallback: 'https://formsubmit.co/ajax/henryleo480@gmail.com'
  };
  
  const TIMEOUT_DURATION = 5000; // 5 seconds max wait

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

    // Validation functions
    function validateForm() {
      let isValid = true;
      const formGroups = form.querySelectorAll('.form-group');

      formGroups.forEach(group => {
        const input = group.querySelector('input, select, textarea');
        const errorMsg = group.querySelector('.error-message');
        
        group.classList.remove('error');
        errorMsg.textContent = '';

        if (!input.value.trim()) {
          group.classList.add('error');
          errorMsg.textContent = 'This field is required';
          isValid = false;
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
          group.classList.add('error');
          errorMsg.textContent = 'Please enter a valid email';
          isValid = false;
        }
      });

      return isValid;
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // Enhanced form submission with timeout and fallback
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      // Show loading state
      submitBtn.disabled = true;
      btnText.textContent = 'Sending...';
      spinner.classList.remove('hidden');
      formStatus.classList.add('hidden');

      const formData = new FormData(form);
      
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('timeout')), TIMEOUT_DURATION);
      });

      try {
        // Try primary endpoint with timeout
        const submitPromise = submitToEndpoint(formData, FORM_ENDPOINTS.primary);
        
        await Promise.race([submitPromise, timeoutPromise]);
        
        // Success!
        showSuccessMessage();
        Analytics.trackInteraction('contact', 'form_submit', 'success');
        
      } catch (error) {
        if (error.message === 'timeout') {
          // Timeout - assume success but show different message
          console.warn('Form submission timeout - showing optimistic success');
          showSuccessMessage(true);
          Analytics.trackInteraction('contact', 'form_submit', 'timeout_success');
        } else {
          // Try fallback endpoint
          console.warn('Primary endpoint failed, trying fallback...');
          try {
            await submitToEndpoint(formData, FORM_ENDPOINTS.fallback);
            showSuccessMessage();
            Analytics.trackInteraction('contact', 'form_submit', 'fallback_success');
          } catch (fallbackError) {
            // Both failed - show error
            showError();
            Analytics.trackInteraction('contact', 'form_submit', 'error');
          }
        }
      } finally {
        submitBtn.disabled = false;
        btnText.textContent = 'Send Message';
        spinner.classList.add('hidden');
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
      form.style.display = 'none';
      if (contactInfo) {
        contactInfo.style.display = 'none';
      }
      successMessage.classList.remove('hidden');
      successMessage.style.display = 'block';
      successMessage.style.gridColumn = 'auto';
      
      // Update message if optimistic
      if (isOptimistic) {
        const successText = successMessage.querySelector('p');
        if (successText) {
          successText.textContent = "Your message is being sent. I'll respond within 24 hours.";
        }
      }
    }

    function showError() {
      formStatus.textContent = 'Unable to send message. Please email me directly at Kachi.Henry.Leo@gmail.com';
      formStatus.classList.remove('hidden', 'success');
      formStatus.classList.add('error');
      formStatus.style.display = 'block';
    }

    // Reset form
    if (newMessageBtn) {
      newMessageBtn.addEventListener('click', () => {
        form.reset();
        if (contactContainer) {
          contactContainer.style.gridTemplateColumns = '';
        }
        form.style.display = 'block';
        if (contactInfo) {
          contactInfo.style.display = 'block';
        }
        successMessage.classList.add('hidden');
        successMessage.style.display = 'none';
        formStatus.classList.add('hidden');
        
        // Reset success message text
        const successText = successMessage.querySelector('p');
        if (successText) {
          successText.textContent = "Thank you for reaching out. I'll respond within 24 hours.";
        }
      });
    }

    // Real-time validation
    form.querySelectorAll('input, select, textarea').forEach(input => {
      input.addEventListener('blur', () => {
        const formGroup = input.closest('.form-group');
        const errorMsg = formGroup.querySelector('.error-message');
        
        formGroup.classList.remove('error');
        errorMsg.textContent = '';

        if (!input.value.trim()) {
          formGroup.classList.add('error');
          errorMsg.textContent = 'This field is required';
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
          formGroup.classList.add('error');
          errorMsg.textContent = 'Please enter a valid email';
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
    
    // Close menu when clicking on a link
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
// PROJECT DETAILS INITIALIZATION
// ==========================================
const ProjectDetails = (() => {
  function init() {
    const currentPage = window.location.pathname.split('/').pop();
    if (currentPage && currentPage !== 'index.html') {
      document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href').includes(currentPage)) {
          link.classList.add('active');
        }
      });
    }
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
// MAIN INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  // Track page view
  Analytics.trackPageView();
  
  // Initialize all modules
  CertificationsModule.init();
  DevToArticles.init();
  SecurityLab.init();
  ContactForm.init();
  MobileNav.init();
  ZeroTrustScroll.init();
  NavbarScroll.init();
  
  // Initialize project details if on a project page
  if (document.querySelector('.project-detail')) {
    ProjectDetails.init();
  }
  
  // Set current year in footer
  const yearElement = document.getElementById('year');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
  
  console.log('✅ Portfolio initialized successfully');
});
