// Embedded fallback keeps the page visible when the JSON fetch cannot run.
const fallbackStories = [
  {
    id: 1,
    title: "Empowering Local Communities",
    description: "How community-driven innovation is shaping sustainable futures.",
    image: "IMAGES/photo1.jpeg",
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
    content: `The next generation is stepping up to lead climate action initiatives. Youth-led movements are driving awareness about environmental issues and pushing for systemic change. From organizing community clean-ups to advocating for policy changes, young people are proving they are powerful agents of change in the fight against climate change.`
  },
  {
    id: 4,
    title: "Our Impact Documentary",
    description: "Watch how we're making a difference in communities.",
    image: "IMAGES/video-thumbnail.jpg.jpeg",
    content: "This documentary showcases our projects and impact...",
    video: "VIDEOS/nascec-video.MP4"
  }
];

let allStories = [];

loadStories();

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

  loadFeaturedStory(stories[0]);
  loadOtherStories(stories.slice(1));
  setupModal(stories);
}

function loadFeaturedStory(story) {
  const featured = document.getElementById("featuredStory");

  featured.innerHTML = `
    <div class="featured-text">
      <h2>${story.title}</h2>
      <p>${story.description}</p>
      <p>${story.content}</p>
    </div>

    <div class="featured-image">
      <img src="${story.image}" alt="${story.title}">
    </div>
  `;
}

function loadOtherStories(stories) {
  const grid = document.getElementById("storyGrid");

  stories.forEach(story => {
    const card = document.createElement("div");
    card.classList.add("story-card");

    card.innerHTML = `
      <img src="${story.image}" alt="${story.title}">
      <h3>${story.title}</h3>
      <p>${story.description}</p>
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
    <div class="modal-content">
      <span class="close">&times;</span>
      <h2 id="modalTitle"></h2>
      <div id="modalMedia" class="story-media"></div>
      <h3 id="modalDescription" class="story-subheading"></h3>
      <div id="modalContent"></div>
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
    image.alt = story.title;
    modalMedia.appendChild(image);
  }
}

function renderStoryContent(story) {
  const modalContent = document.getElementById("modalContent");
  modalContent.innerHTML = "";

  const storyText = document.createElement("p");
  storyText.textContent = story.content;
  modalContent.appendChild(storyText);

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

