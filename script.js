// Certifications Data - Enhanced with more details
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
    description: "Demonstrates expertise in designing distributed systems on AWS."
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
    issuer: "Neo Cloud",
    year: "2024",
    image: "neo.jpg",
    category: "security",
    description: "Practical training in penetration testing and vulnerability assessment."
  },
  {
    title: "Solutions Architect",
    issuer: "Neo Cloud",
    year: "2024",
    image: "neo.jpg",
    category: "aws",
    description: "Practical training in Cloud Enviroment (AWS, Azure, GPC)."
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


// Initialize Filters with better organization
function initCertFilters() {
  const filtersContainer = document.getElementById('cert-filters');
  const filterCategories = [
    { id: 'all', label: 'All Certifications' },
    { id: 'security', label: 'Security' },
    { id: 'aws', label: 'AWS' },
    { id: 'data', label: 'Data' },
    { id: 'ai', label: 'AI' }
  ];
  
  // Clear existing filters
  filtersContainer.innerHTML = '';
  
  filterCategories.forEach(filter => {
    const button = document.createElement('button');
    button.textContent = filter.label;
    button.dataset.filter = filter.id;
    button.classList.add('filter-btn');
    button.addEventListener('click', () => {
      filterCerts(filter.id);
      updateActiveFilter(button);
    });
    filtersContainer.appendChild(button);
  });
  
  // Set 'all' as default active filter
  filtersContainer.firstChild.classList.add('active');
}

// Update active filter state
function updateActiveFilter(activeButton) {
  document.querySelectorAll('#cert-filters button').forEach(btn => {
    btn.classList.remove('active');
  });
  activeButton.classList.add('active');
}

// Filter Certifications with better performance
function filterCerts(filter) {
  const certGrid = document.querySelector('.cert-grid');
  
  // Show loading state
  certGrid.innerHTML = '<div class="loading-spinner"></div>';
  
  // Use setTimeout to allow UI to update before heavy operation
  setTimeout(() => {
    const filteredCerts = filter === 'all' 
      ? certifications 
      : certifications.filter(cert => cert.category === filter);
    
    renderCerts(filteredCerts);
  }, 50);
}

// Render Certifications with enhanced UI
function renderCerts(certs) {
  const certGrid = document.querySelector('.cert-grid');
  
  if (certs.length === 0) {
    certGrid.innerHTML = '<p class="no-results">No certifications found in this category.</p>';
    return;
  }
  
  certGrid.innerHTML = '';
  
  certs.forEach(cert => {
    const certCard = document.createElement('div');
    certCard.className = 'cert-card';
    certCard.innerHTML = `
      <div class="cert-badge">
        <img src="assets/images/cert-badges/${cert.image}" alt="${cert.issuer} ${cert.title}" loading="lazy">
        ${cert.candidate ? '<span class="candidate-badge">In Progress</span>' : ''}
      </div>
      <div class="cert-details">
        <h3>${cert.title}</h3>
        <p class="issuer">${cert.issuer}</p>
        <p class="cert-date">${cert.year}</p>
        <p class="cert-description">${cert.description}</p>
      </div>
    `;
    certGrid.appendChild(certCard);
  });
}

// Enhanced Dev.to API Integration with caching
async function loadDevToArticles() {
  const feed = document.getElementById('devto-feed');
  
  // Show loading state
  feed.innerHTML = `
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
    <div class="skeleton-card"></div>
  `;
  
  try {
    // Try to get from cache first
    const cacheKey = 'devto-articles';
    const cachedData = localStorage.getItem(cacheKey);
    
    let articles;
    
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      
      // Use cache if less than 1 hour old
      if (Date.now() - timestamp < 3600000) {
        articles = data;
      }
    }
    
    // If no cache or cache expired, fetch fresh data
    if (!articles) {
      const response = await fetch('https://dev.to/api/articles?username=leonardkachi&per_page=6');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      articles = await response.json();
      
      // Update cache
      localStorage.setItem(cacheKey, JSON.stringify({
        data: articles,
        timestamp: Date.now()
      }));
    }
    
    renderArticles(articles);
  } catch (error) {
    console.error('Error loading Dev.to articles:', error);
    showErrorFallback();
  }
}

function renderArticles(articles) {
  const feed = document.getElementById('devto-feed');
  
  if (!articles || articles.length === 0) {
    showErrorFallback();
    return;
  }
  
  feed.innerHTML = '';
  
  articles.forEach(article => {
    const articleCard = document.createElement('article');
    articleCard.className = 'article-card';
    articleCard.innerHTML = `
      <div class="article-image-container">
        <img src="${article.cover_image || getPlaceholderImage(article.title)}" 
             alt="${article.title}" 
             class="article-image" 
             loading="lazy">
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
    feed.appendChild(articleCard);
  });
}

function getPlaceholderImage(title) {
  const colors = ['1e3d38', '0d1f23', '11232b'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];
  return `https://via.placeholder.com/600x400/${randomColor}/3aafa9?text=${encodeURIComponent(title.substring(0, 30))}`;
}

function showErrorFallback() {
  const fallbackArticles = [
    {
      title: "AWS Security Best Practices",
      url: "https://dev.to/leonardkachi/aws-security",
      description: "Comprehensive guide to securing AWS infrastructure with IAM policies, encryption, and monitoring.",
      published_at: new Date().toISOString(),
      positive_reactions_count: 28,
      reading_time_minutes: 5,
      cover_image: getPlaceholderImage("AWS Security")
    },
    {
      title: "Terraform for Security Engineers",
      url: "https://dev.to/leonardkachi/terraform-security",
      description: "Implementing security controls through Infrastructure as Code with Terraform modules.",
      published_at: new Date().toISOString(),
      positive_reactions_count: 34,
      reading_time_minutes: 8,
      cover_image: getPlaceholderImage("Terraform Security")
    }
  ];
  
  renderArticles(fallbackArticles);
}

// Security Lab Module
const SecurityLab = (() => {
  // Cloud service actions database
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

  // Attack patterns database
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
    }
  };

  // Policy templates database
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
    }
  };

  // Initialize the security lab
  function init() {
    initScenarioSwitcher();
    initIAMSimulator();
    initAttackSimulator();
    initPolicyRecommender();
    initNetworkVisualizer();
  }

  // Scenario switching functionality
  function initScenarioSwitcher() {
    const scenarioButtons = document.querySelectorAll('.scenario-btn');
    
    scenarioButtons.forEach(button => {
      button.addEventListener('click', () => {
        // Update active button
        scenarioButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Show corresponding content
        const scenario = button.dataset.scenario;
        document.querySelectorAll('.scenario-content').forEach(content => {
          content.classList.remove('active');
          if (content.id === `${scenario}-scenario`) {
            content.classList.add('active');
          }
        });
      });
    });
  }

  // IAM Policy Simulator
  function initIAMSimulator() {
    const cloudProvider = document.getElementById('cloud-provider');
    const actionListContainer = document.getElementById('action-list-container');
    const testButton = document.getElementById('test-policy-btn');
    const policyInput = document.getElementById('policy-input');
    const resultsPanel = document.getElementById('policy-results');
    const actionPresets = document.getElementById('action-presets');
    
    // Update actions when cloud provider changes
    cloudProvider.addEventListener('change', updateActionList);
    updateActionList();
    
    // Test policy button handler
    testButton.addEventListener('click', testPolicy);
    
    // Policy template selector
    actionPresets.addEventListener('change', loadPolicyTemplate);
    
    // Update available actions based on selected cloud provider
    function updateActionList() {
      const provider = cloudProvider.value;
      actionListContainer.innerHTML = '';
      
      Object.entries(cloudActions[provider]).forEach(([service, actions]) => {
        const serviceGroup = document.createElement('div');
        serviceGroup.className = 'action-group';
        serviceGroup.innerHTML = `<h5>${service}</h5>`;
        
        actions.forEach(action => {
          const actionId = action.replace(/[:.]/g, '-');
          const label = document.createElement('label');
          label.innerHTML = `
            <input type="checkbox" 
                   name="action" 
                   id="${actionId}"
                   value="${action}">
            ${action}
          `;
          serviceGroup.appendChild(label);
        });
        
        actionListContainer.appendChild(serviceGroup);
      });
    }
    
    // Load a policy template
    function loadPolicyTemplate(e) {
      if (e.target.value && policyTemplates[e.target.value]) {
        policyInput.value = policyTemplates[e.target.value].policy;
      }
    }
    
    // Test the current policy against selected actions
    function testPolicy() {
      try {
        const policy = JSON.parse(policyInput.value);
        const selectedActions = Array.from(
          document.querySelectorAll('input[name="action"]:checked')
        ).map(el => el.value);
        
        if (selectedActions.length === 0) {
          showResultError('Please select at least one action to test');
          return;
        }
        
        const results = evaluatePolicy(policy, selectedActions);
        renderResults(results);
      } catch (error) {
        showResultError(`Invalid policy: ${error.message}`);
      }
    }
    
    // Evaluate policy against actions
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
        
        // Check for explicit denies first
        const denyStatement = policy.Statement.find(s => 
          s.Effect === 'Deny' && matchesAction(s.Action, action)
        );
        
        if (denyStatement) {
          result.allowed = false;
          result.denyReason = 'Explicitly denied by policy';
          results.push(result);
          return;
        }
        
        // Check for allows
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
    
    // Check if policy action matches test action
    function matchesAction(policyActions, testAction) {
      if (typeof policyActions === 'string') {
        policyActions = [policyActions];
      }
      
      return policyActions.some(policyAction => {
        // Exact match
        if (policyAction === testAction) return true;
        
        // Wildcard match
        if (policyAction === '*') return true;
        
        // Service wildcard (e.g., "s3:*")
        const [service, permission] = testAction.split(':');
        if (policyAction === `${service}:*`) return true;
        
        // Partial wildcard (e.g., "s3:Get*")
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
    
    // Validate policy structure
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
          
          if (!stmt.Action || 
              (Array.isArray(stmt.Action) && stmt.Action.length === 0)) {
            issues.push(`Statement ${i+1}: No actions specified`);
          }
          
          if (stmt.Resource === '*') {
            issues.push(`Statement ${i+1}: Using wildcard (*) resource may be overly permissive`);
          }
        });
      }
      
      return issues;
    }
    
    // Render evaluation results
    function renderResults({ actionResults, validation }) {
      resultsPanel.innerHTML = '';
      
      const resultsHeader = document.createElement('h4');
      resultsHeader.textContent = 'Policy Evaluation Results';
      resultsPanel.appendChild(resultsHeader);
      
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
          ${result.denyReason ? `
            <div class="result-reason deny">${result.denyReason}</div>
          ` : `
            <div class="result-reason">${result.reason}</div>
          `}
        `;
        
        resultsPanel.appendChild(resultItem);
      });
      
      if (validation.length > 0) {
        const validationHeader = document.createElement('h4');
        validationHeader.textContent = 'Policy Validation Issues';
        validationHeader.style.marginTop = '1rem';
        resultsPanel.appendChild(validationHeader);
        
        validation.forEach(issue => {
          const issueItem = document.createElement('div');
          issueItem.className = 'validation-issue';
          issueItem.textContent = issue;
          resultsPanel.appendChild(issueItem);
        });
      }
    }
    
    // Show error in results panel
    function showResultError(message) {
      resultsPanel.innerHTML = `
        <div class="error-message">
          <h4>Error</h4>
          <p>${message}</p>
        </div>
      `;
    }
  }

  // Attack Simulator
  function initAttackSimulator() {
    const attackType = document.getElementById('attack-type');
    const startBtn = document.getElementById('start-attack');
    const stopBtn = document.getElementById('stop-attack');
    const attackLog = document.getElementById('attack-log');
    let attackInterval;
    
    // Initialize attack log
    attackLog.innerHTML = '<p class="info-message">Select an attack scenario to begin simulation</p>';
    
    // Update attack details when type changes
    attackType.addEventListener('change', updateAttackDetails);
    
    // Start attack simulation
    startBtn.addEventListener('click', startAttack);
    
    // Stop attack simulation
    stopBtn.addEventListener('click', stopAttack);
    
    // Update attack description and details
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
    
    // Start the attack simulation
    function startAttack() {
      const attackId = attackType.value;
      
      if (!attackId) {
        alert('Please select an attack scenario first');
        return;
      }
      
      const attack = attackPatterns[attackId];
      let step = 0;
      
      // Update UI state
      startBtn.disabled = true;
      stopBtn.disabled = false;
      attackType.disabled = true;
      
      // Clear log and add simulation start message
      attackLog.innerHTML = `
        <div class="simulation-start">
          Starting simulation: ${attack.name}
        </div>
      `;
      
      // Run simulation steps
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
        } else {
          // Simulation complete
          clearInterval(attackInterval);
          attackLog.innerHTML += `
            <div class="simulation-end">
              Attack simulation completed
            </div>
          `;
          resetControls();
        }
        
        // Scroll to bottom
        attackLog.scrollTop = attackLog.scrollHeight;
      }, 2000);
    }
    
    // Stop the attack simulation
    function stopAttack() {
      clearInterval(attackInterval);
      attackLog.innerHTML += `
        <div class="simulation-stop">
          Simulation stopped by user
        </div>
      `;
      resetControls();
      attackLog.scrollTop = attackLog.scrollHeight;
    }
    
    // Reset control states
    function resetControls() {
      startBtn.disabled = false;
      stopBtn.disabled = true;
      attackType.disabled = false;
    }
  }

  // Policy Recommender
  function initPolicyRecommender() {
    const recommendBtn = document.getElementById('recommend-policy');
    const policyInput = document.getElementById('policy-input');
    const resultsPanel = document.getElementById('policy-results');
    
    recommendBtn.addEventListener('click', showRecommendations);
    
    function showRecommendations() {
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
          <button class="btn-outline apply-policy" 
                  data-policy='${JSON.stringify(template.policy)}'>
            Apply This Policy
          </button>
        `;
        
        resultsPanel.appendChild(recommendation);
      });
      
      // Add event listeners to apply buttons
      document.querySelectorAll('.apply-policy').forEach(btn => {
        btn.addEventListener('click', (e) => {
          policyInput.value = JSON.parse(e.target.dataset.policy);
          resultsPanel.innerHTML = `
            <div class="applied-notice">
              Policy template applied to editor
            </div>
          `;
        });
      });
    }
  }

  // Network Visualizer
  function initNetworkVisualizer() {
    const networkViz = document.querySelector('.network-visualization');
    
    if (!networkViz) return;
    
    // Initialize network security visualization
    initNetworkSecurity();
    
    // Add click handler for the button
    const showSgBtn = document.getElementById('show-sg-btn');
    if (showSgBtn) {
      showSgBtn.addEventListener('click', initNetworkSecurity);
    }
  }

  // Network Security Visualization
  function initNetworkSecurity() {
    const networkViz = document.querySelector('.network-visualization');
    if (!networkViz) return;

    // Security groups data
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

    // Create the network visualization HTML
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

    // Add hover effects and click handlers
    document.querySelectorAll('.instance').forEach(instance => {
      // Hover effects
      instance.addEventListener('mouseenter', function() {
        this.classList.add('highlight');
      });
      
      instance.addEventListener('mouseleave', function() {
        this.classList.remove('highlight');
      });
      
      // Click handler to show security groups
      instance.addEventListener('click', function() {
        const sgName = this.dataset.sg;
        if (sgName && securityGroups[sgName]) {
          showSecurityGroupDetails(sgName);
        }
      });
    });

    // Function to display security group details
    function showSecurityGroupDetails(sgName) {
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

  // Public API
  return {
    init
  };
})();

// Contact Form Handler
const ContactForm = (() => {
  // Initialize the contact form
  function init() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    
    // Check for success state in URL
    checkForSuccessState();
    
    // Set up form validation and submission
    setupFormValidation(form);
    setupFormSubmission(form);
    
    // Initialize select dropdown styling
    initSelectStyles();
  }
  
  // Initialize select dropdown styles
  function initSelectStyles() {
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
      select.style.colorScheme = 'dark'; // Ensure dark mode for selects
    });
  }
  
  // Check URL for success param
  function checkForSuccessState() {
    const urlParams = new URLSearchParams(window.location.search);
    const form = document.getElementById('contact-form');
    const successMessage = document.getElementById('success-message');
    
    if (urlParams.get('success') === 'true') {
      form.classList.add('hidden');
      successMessage.classList.remove('hidden');
    }
    
    // Set up new message button
    document.getElementById('new-message-btn')?.addEventListener('click', () => {
      form.reset();
      successMessage.classList.add('hidden');
      form.classList.remove('hidden');
      window.history.replaceState({}, document.title, window.location.pathname);
    });
  }
  
  // Set up form validation
  function setupFormValidation(form) {
    // Real-time validation for all inputs
    form.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('input', () => validateField(input));
    });
    
    // Add custom validation for the form
    form.addEventListener('submit', function(e) {
      if (!validateForm(this)) {
        e.preventDefault();
      }
    });
  }
  
  // Validate a single field
  function validateField(field) {
    const formGroup = field.closest('.form-group');
    const errorMessage = formGroup.querySelector('.error-message');
    
    // Reset state
    formGroup.classList.remove('invalid', 'valid');
    errorMessage.textContent = '';
    
    // Validate based on field type
    if (field.validity.valid) {
      formGroup.classList.add('valid');
    } else {
      showFieldError(field, formGroup, errorMessage);
    }
  }
  
  // Show field error message
  function showFieldError(field, formGroup, errorElement) {
    formGroup.classList.add('invalid');
    
    if (field.validity.valueMissing) {
      errorElement.textContent = 'This field is required';
    } else if (field.validity.typeMismatch) {
      errorElement.textContent = field.type === 'email' 
        ? 'Please enter a valid email address' 
        : 'Invalid format';
    } else if (field.validity.tooShort) {
      errorElement.textContent = `Minimum length is ${field.minLength} characters`;
    } else if (field.validity.patternMismatch) {
      errorElement.textContent = field.title || 'Invalid input format';
    }
  }
  
  // Validate entire form
  function validateForm(form) {
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
      const formGroup = field.closest('.form-group');
      const errorMessage = formGroup.querySelector('.error-message');
      
      if (!field.validity.valid) {
        showFieldError(field, formGroup, errorMessage);
        isValid = false;
        
        // Scroll to first error
        if (isValid === false) {
          field.focus();
        }
      }
    });
    
    return isValid;
  }
  
  // Set up form submission
  function setupFormSubmission(form) {
    const submitBtn = document.getElementById('submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');
    const statusMessage = document.getElementById('form-status');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      if (!validateForm(form)) return;
      
      try {
        // Show loading state
        btnText.textContent = 'Sending...';
        spinner.classList.remove('hidden');
        submitBtn.disabled = true;
        statusMessage.classList.add('hidden');
        
        // Submit form data
        const formData = new FormData(form);
        const response = await fetch(form.action, {
          method: 'POST',
          body: formData,
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (response.ok) {
          // Show success state
          document.getElementById('success-message').classList.remove('hidden');
          form.classList.add('hidden');
          form.reset();
          
          // Update URL without reload
          window.history.pushState({}, '', '#contact?success=true');
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        statusMessage.textContent = 'Error sending message. Please try again.';
        statusMessage.classList.remove('hidden');
      } finally {
        // Reset button state
        btnText.textContent = 'Send Message';
        spinner.classList.add('hidden');
        submitBtn.disabled = false;
      }
    });
  }
  
  // Public API
  return {
    init
  };
})();

// Mobile Navigation
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  
  hamburger?.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
  
  // Close menu when clicking on a link
  navLinks?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize certifications section
  initCertFilters();
  renderCerts(certifications);
  
  // Load Dev.to articles
  loadDevToArticles();
  
  // Initialize security lab
  SecurityLab.init();
  
  // Initialize contact form
  ContactForm.init();
  
  // Initialize mobile navigation
  initMobileNav();
  
  // Set current year in footer
  document.getElementById('year').textContent = new Date().getFullYear();
  
  // Add scroll event for navbar
  window.addEventListener('scroll', () => {
    document.querySelector('.navbar').classList.toggle('scrolled', window.scrollY > 50);
  });
});
