// Embedded fallback keeps the page visible when the JSON fetch cannot run.
const fallbackStories = [
  {
    id: 1,
    title: "Empowering Local Communities",
    description: "How community-driven innovation is shaping sustainable futures.",
    image: "IMAGES/photo1.jpeg",
    imageCaption: "Students planting trees at Musunji Comprehensive School",
    photographer: {
      name: "NASCEC Media Team",
      website: "https://nascec.org"
    },
    content: `At Musunji Comprehensive School, restoration is more than planting trees—it is about planting hope, knowledge, and responsibility in the next generation. Through the Storytelling for Restoration Project, learners, teachers, and community members are coming together to reconnect with nature and share stories that inspire environmental action.

The project recognizes that every tree planted carries a story. Stories of indigenous knowledge, community resilience, and the collective effort to protect the environment for future generations. By engaging learners in storytelling activities, environmental education, and practical restoration exercises, the initiative helps young people understand the importance of conserving natural resources while becoming active participants in restoring degraded landscapes.

The tree-planting activities at Musunji Comprehensive School provide hands-on learning opportunities where students not only contribute to environmental restoration but also develop a deeper appreciation for their role as environmental stewards. Community members, teachers, and local leaders work alongside the learners, demonstrating that sustainable change is achieved when everyone contributes.

Through storytelling, these restoration efforts are documented, celebrated, and shared with wider audiences, ensuring that local voices and experiences remain at the center of conservation efforts. The stories emerging from Musunji inspire action, preserve cultural knowledge, and encourage communities to embrace environmentally responsible practices.

By combining restoration with storytelling, Musunji Comprehensive School is nurturing a generation that understands the power of both words and actions in creating a greener, healthier, and more sustainable future for all.`
  },
  {
    id: 2,
    title: "Innovation Through Technology-(Ecogeim)",
    description: "Code, Culture, and Conservation: Tech for Sacred Spaces.",
    image: "IMAGES/Ecogeim.jpeg",
    imageCaption: "EcoGeim Logo",
    photographer: {
      name: "NASCEC Media Team",
      website: "https://nascec.org"
    },
    content: `True climate action begins directly on the soil and echoes through our stories. Ecogeim unites digital citizen science with indigenous pride, turning mobile devices into absolute shields for environmental preservation. By tracking local pollution hotspots, preserving native biodiversity data, and making environmental activism accessible, our youth are mapping a resilient path forward for our ancestral lands. Check out our technology milestones and fetch the official activities list today.`,
    websiteLabel: "ecogeim.com",
    websiteUrl: "https://ecogeim.com",
    contactEmail: "info@ecogeim.com"
  },
  {
    id: 3,
    title: "Youth and Climate Action",
    description: "Young people taking the lead in environmental protection.",
    image: "IMAGES/photo 3.jpeg",
    imageCaption: "Youth volunteers planting trees together",
    photographer: {
      name: "NASCEC Youth Media",
      website: "https://nascec.org"
    },
    content: `The next generation is stepping up to lead climate action initiatives. Youth-led movements are driving awareness about environmental issues and pushing for systemic change. From organizing community clean-ups to advocating for policy changes, young people are proving they are powerful agents of change in the fight against climate change.`
  },
  {
  "id": 4,
  "title": "The Story Behind the Stories: NASCEC's Journey from Vision to Action",
  "image": "IMAGES/Patron Planting a Tree.jpg",
  "imageCaption": "Patron Nascec Planting A tree with a student AT Musunji Comprehensive School",
  "photographer": {
    "name": "NASCEC Media Team",
    "website": "https://nascec.org"
  },
  "content": "For centuries, the forests of Vihiga have been more than just trees and wildlife. They have been repositories of memory, where elders pass down wisdom through stories, proverbs, and songs. But as the forests have faced threats from deforestation and climate change, these stories have also begun to fade.\n\nThis is where NASCEC's journey truly begins. It starts with a recognition that the decline of our forests and the loss of our cultural memory are not separate crises. They are two sides of the same coin. And if we are to address one, we must also address the other.\n\nNASCEC was born from this insight. A vision that grew out of conversations with elders under the canopy of Tiriki Forest, and the determination of a scholar who saw the connection between environmental degradation and cultural erosion. The vision was simple yet profound: use the power of storytelling to inspire environmental action.\n\nOver time, this vision has taken shape. Today, NASCEC is a community of farmers, teachers, elders, youth, and professionals working together to record stories, plant trees, and educate the next generation. The work is rooted in the belief that indigenous knowledge is not a relic of the past, but a practical guide for addressing the challenges of today.\n\nThe results have been remarkable. Students are learning about conservation through the stories of their grandparents. Communities are planting trees that their ancestors would have recognized. And a new generation of environmental leaders is emerging, carrying forward both the wisdom of the past and the innovations of the present.\n\nNASCEC is proof that change is possible when we honor where we come from. It is a reminder that the stories we tell matter, not just for preserving memory, but for shaping the future. And it is a testament to the power of community to rewrite its own narrative, one tree, one story, one generation at a time."
},
  {
    id: 5,
    title: "Our Impact Documentary",
    description: "Watch how we're making a difference in communities.",
    image: "IMAGES/video-thumbnail.jpg.jpeg",
    content: "This documentary showcases our projects and impact...",
    video: "VIDEOS/nascec-video.MP4"
  }
];

let allStories = [];

loadStories();

/**
 * Escape HTML to prevent accidental markup injection when inserting into innerHTML.
 */
function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Turn plain-text content with blank-line separators into HTML paragraphs.
 * Single newlines inside a paragraph become <br> for line breaks.
 */
function formatContentHtml(content) {
  if (!content) return '';
  const parts = String(content).trim().split(/\r?\n\s*\r?\n/);
  return parts.map(p => `<p style="font-style: normal;">${escapeHtml(p).replace(/\r?\n/g, '<br>')}</p>`).join('');
}

function getPhotographerCreditHtml(story) {
  const photographerName = story.photographer?.name;
  const photographerUrl = story.photographer?.website;
  const fallback = story.credit;

  if (photographerName) {
    const creditText = `Credit: ${escapeHtml(photographerName)}`;
    if (photographerUrl) {
      return `<span class="story-caption-credit">Credit: <a href="${escapeHtml(photographerUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(photographerName)}</a></span>`;
    }
    return `<span class="story-caption-credit">${creditText}</span>`;
  }

  if (fallback) {
    return `<span class="story-caption-credit">Credit: ${escapeHtml(fallback)}</span>`;
  }

  return "";
}

async function loadStories() {
  let stories = fallbackStories;

  try {
    const response = await fetch("stories.json", { cache: "no-store" });

    if (!response.ok) {
      throw new Error(`Failed to load stories.json (${response.status})`);
    }

    const loadedStories = await response.json();
    if (Array.isArray(loadedStories) && loadedStories.length > 0) {
      stories = loadedStories;
    }
  } catch (error) {
    console.warn("Using embedded stories content because stories.json could not be loaded.", error);
  }

  setupCarousel(stories);
  loadFeaturedStory(stories[0]);
  loadOtherStories(stories.slice(1));
  setupModal(stories);
}
function setupCarousel(stories) {
  const carouselContainer = document.getElementById("latestStoriesCarousel");
  if (!carouselContainer) return;

  // Take the 4 latest stories
  const latestFour = stories.slice(0, 4);
  if (latestFour.length === 0) return;

  let slidesHtml = "";
  let dotsHtml = "";

  latestFour.forEach((story, idx) => {
    const isActive = idx === 0 ? "active" : "";
    slidesHtml += `
      <div class="carousel-slide ${isActive}" data-id="${story.id}">
        <img class="carousel-image" src="${story.cardImage || story.image}" alt="${story.imageDescription || story.title}">
        <div class="carousel-overlay">
          <h3 class="carousel-title">${escapeHtml(story.title)}</h3>
          <p class="carousel-caption">${escapeHtml(story.cardCaption || story.imageCaption || story.imageDescription || story.description)}</p>
          ${getPhotographerCreditHtml(story) ? `<div class="carousel-credit">${getPhotographerCreditHtml(story)}</div>` : ''}
        </div>
      </div>
    `;
    dotsHtml += `
      <button class="carousel-dot ${isActive}" data-index="${idx}" aria-label="Go to slide ${idx + 1}"></button>
    `;
  });

  carouselContainer.innerHTML = `
    <div class="carousel-inner">
      ${slidesHtml}
    </div>
    <div class="carousel-dots">
      ${dotsHtml}
    </div>
  `;

  // Carousel behavior
  let currentSlide = 0;
  const slides = carouselContainer.querySelectorAll(".carousel-slide");
  const dots = carouselContainer.querySelectorAll(".carousel-dot");
  let slideInterval;

  function showSlide(index) {
    slides[currentSlide].classList.remove("active");
    dots[currentSlide].classList.remove("active");
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function startAutoSlide() {
    stopAutoSlide();
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoSlide() {
    if (slideInterval) {
      clearInterval(slideInterval);
    }
  }

  // Click on dots to change slide - FIXED: Check if dots exists
  if (dots && dots.length > 0) {
    dots.forEach(dot => {
      dot.addEventListener("click", () => {
        const idx = parseInt(dot.getAttribute("data-index"), 10);
        showSlide(idx);
        startAutoSlide();
      });
    });
  }

  // Click on slide to open story modal
  slides.forEach(slide => {
    slide.addEventListener("click", (e) => {
      if (e.target.classList.contains("carousel-dot") || e.target.tagName === "A") {
        return;
      }
      const storyId = slide.getAttribute("data-id");
      const story = stories.find(s => s.id == storyId);
      if (story) {
        showModal(story);
      }
    });
  });

  // Pause on hover
  carouselContainer.addEventListener("mouseenter", stopAutoSlide);
  carouselContainer.addEventListener("mouseleave", startAutoSlide);

  startAutoSlide();
}
  function showSlide(index) {
    slides[currentSlide].classList.remove("active");
    dots[currentSlide].classList.remove("active");
    currentSlide = (index + slides.length) % slides.length;
    slides[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function startAutoSlide() {
    stopAutoSlide();
    slideInterval = setInterval(nextSlide, 5000);
  }

  function stopAutoSlide() {
    if (slideInterval) {
      clearInterval(slideInterval);
    }
  }

 // Click on dots to change slide
if (dots && dots.length > 0) {
  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const idx = parseInt(dot.getAttribute("data-index"), 10);
      showSlide(idx);
      startAutoSlide(); // reset timer on click
    });
  });
}
  // Click on slide to open story modal
  slides.forEach(slide => {
    slide.addEventListener("click", (e) => {
      if (e.target.classList.contains("carousel-dot") || e.target.tagName === "A") {
        return;
      }
      const storyId = slide.getAttribute("data-id");
      const story = stories.find(s => s.id == storyId);
      if (story) {
        showModal(story);
      }
    });
  });

  carouselContainer.addEventListener("mouseenter", stopAutoSlide);
  carouselContainer.addEventListener("mouseleave", startAutoSlide);

  startAutoSlide();


function loadFeaturedStory(story) {
  const featured = document.getElementById("featuredStory");

  featured.innerHTML = `
  
    <div class="featured-text story-text-container">
      <div class="article-header">
        <div class="article-publication">
          <img src="IMAGES/logo.jpeg" alt="NASCEC Logo" class="article-logo">
          <div class="article-pub-details">
            <span class="pub-name">NASCEC JOURNAL</span>
            <span class="pub-issue">Native Storytelling & Conservation</span>
          </div>
        </div>
        <div class="article-meta">
          <span class="meta-label">LATEST STORY</span>
        </div>
      </div>

      <h2>${story.title}</h2>
      <p class="featured-deck">${story.description}</p>
      <div class="article-divider"></div>
      <div class="featured-image">
      <figure>
        <img src="${story.image}" alt="${story.imageDescription || story.title}">
        <figcaption class="story-caption">
          <span class="story-caption-desc">${story.imageCaption || story.imageDescription || story.description}</span>
          ${getPhotographerCreditHtml(story)}
        </figcaption>
      </figure>
    </div>
      <div class="article-body-featured">
        ${formatContentHtml(story.content)}
      </div>

      ${story.websiteUrl || story.contactEmail ? `
        <div class="featured-story-links">
          ${story.websiteUrl ? `
            <span class="story-link">
              Visit <a href="${story.websiteUrl}" target="_blank" rel="noopener noreferrer">${story.websiteLabel || story.websiteUrl}</a>
            </span>
          ` : ''}
          ${story.contactEmail ? `
            <span class="story-link">
              Contact us at <a href="mailto:${story.contactEmail}">${story.contactEmail}</a>
            </span>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `;
}

function loadOtherStories(stories) {
  const grid = document.getElementById("storyGrid");

  stories.forEach(story => {
    const card = document.createElement("div");
    card.classList.add("story-card");

    card.innerHTML = `
      <figure>
        <img src="${story.image}" alt="${story.imageDescription || story.title}">
        <figcaption class="story-caption story-card-caption">
          <span class="story-caption-desc">${story.cardDescription || story.imageCaption || story.imageDescription || story.description}</span>
          ${getPhotographerCreditHtml(story)}
        </figcaption>
      </figure>
      <h3>${story.title}</h3>
      <a href="#" class="read-more" data-id="${story.id}">Read More →</a>
    `;

    grid.appendChild(card);
  });
}

function setupModal(stories) {
  allStories = stories;

  // Create modal HTML
  const modal = document.createElement("div");
  modal.id = "storyModal";
  modal.className = "modal";
  modal.innerHTML = `
    <div class="modal-content article-layout">
      <span class="close-article close">&times;</span>
      <div class="article-header">
        <div class="article-publication">
          <img src="IMAGES/logo.jpeg" alt="NASCEC Logo" class="article-logo">
          <div class="article-pub-details">
            <span class="pub-name">NASCEC JOURNAL</span>
            <span class="pub-issue">Native Storytelling & Conservation</span>
          </div>
        </div>
        <div class="article-meta">
          <span class="meta-label">DOCUMENTING ECOLOGICAL CHANGE</span>
        </div>
      </div>
      <h1 id="modalTitle" class="article-headline"></h1>
      <p id="modalDescription" class="article-deck"></p>
      <div class="article-divider"></div>
      <div class="article-media-container">
        <div id="modalMedia" class="story-media"></div>
        <div id="modalCaption" class="story-caption modal-caption"></div>
      </div>
      <div id="modalContent" class="article-body"></div>
    </div>
  `;
  document.body.appendChild(modal);

  // Add click handlers to all "Read More" buttons
  document.querySelectorAll(".read-more").forEach(button => {
    button.addEventListener("click", (e) => {
      e.preventDefault();
      const storyId = e.target.getAttribute("data-id");
      const story = allStories.find(s => s.id == storyId);
      if (story) {
        showModal(story);
      }
    });
  });

  // Close modal when X is clicked
  document.querySelector(".close").addEventListener("click", closeModal);

  // Close modal when clicking outside the content
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
}
function showModal(story) {
  const modal = document.getElementById("storyModal");
  document.getElementById("modalTitle").textContent = story.title;
  document.getElementById("modalDescription").textContent = story.description;
  renderStoryMedia(story);
  renderStoryCaption(story);
  renderStoryContent(story);

  modal.style.display = "block";
}

function renderStoryMedia(story) {
  const modalMedia = document.getElementById("modalMedia");
  modalMedia.innerHTML = "";

  if (story.video) {
    const video = document.createElement("video");
    video.controls = true;
    video.preload = "metadata";
    video.playsInline = true;

    if (story.image) {
      video.poster = story.image;
    }

    const source = document.createElement("source");
    source.src = story.video;
    source.type = "video/mp4";

    video.appendChild(source);
    video.textContent = "Your browser does not support the video tag.";

    modalMedia.appendChild(video);
    return;
  }

  if (story.image) {
    const image = document.createElement("img");
    image.src = story.image;
    image.alt = story.imageDescription || story.title;
    modalMedia.appendChild(image);
  }
}

function renderStoryCaption(story) {
  const modalCaption = document.getElementById("modalCaption");
  modalCaption.innerHTML = `
    <span class="story-caption-desc">${story.cardDescription || story.imageCaption || story.imageDescription || story.description}</span>
    ${getPhotographerCreditHtml(story)}
  `;
}

function renderStoryContent(story) {
  const modalContent = document.getElementById("modalContent");
  modalContent.innerHTML = formatContentHtml(story.content);

  if (story.websiteUrl) {
    const websiteText = document.createElement("p");
    websiteText.className = "story-link";
    websiteText.append("Visit ");

    const websiteLink = document.createElement("a");
    websiteLink.href = story.websiteUrl;
    websiteLink.textContent = story.websiteLabel || story.websiteUrl;
    websiteLink.target = "_blank";
    websiteLink.rel = "noopener noreferrer";

    websiteText.appendChild(websiteLink);
    modalContent.appendChild(websiteText);
  }

  if (story.contactEmail) {
    const contactText = document.createElement("p");
    contactText.className = "story-link";
    contactText.append("Contact us at ");

    const contactLink = document.createElement("a");
    contactLink.href = `mailto:${story.contactEmail}`;
    contactLink.textContent = story.contactEmail;

    contactText.appendChild(contactLink);
    modalContent.appendChild(contactText);
  }
}

function closeModal() {
  document.getElementById("storyModal").style.display = "none";
}

