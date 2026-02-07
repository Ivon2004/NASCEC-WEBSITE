fetch("stories.json")
  .then(response => response.json())
  .then(stories => {
    loadFeaturedStory(stories[0]);
    loadOtherStories(stories.slice(1));
    setupModal(stories);
  })
  .catch(error => console.error("Error loading stories:", error));

let allStories = [];

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
      <img id="modalImage" src="" alt="" style="max-width: 100%; margin: 20px 0;">
      <p id="modalDescription"></p>
      <p id="modalContent"></p>
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
  document.getElementById("modalContent").textContent = story.content;
  
  const imageElement = document.getElementById("modalImage");
  
  if (story.video) {
    // Hide the image element and create a video instead
    imageElement.style.display = "none";
    
    // Remove any existing video
    const existingVideo = imageElement.nextElementSibling;
    if (existingVideo && existingVideo.tagName === "VIDEO") {
      existingVideo.remove();
    }
    
    // Create new video element
    const video = document.createElement("video");
    video.width = "100%";
    video.height = "auto";
    video.controls = true;
    video.style.margin = "20px 0";
    video.style.display = "block";
    
    const source = document.createElement("source");
    source.src = story.video;
    source.type = "video/mp4";
    
    video.appendChild(source);
    video.textContent = "Your browser does not support the video tag.";
    
    // Insert video after the image element
    imageElement.parentElement.insertBefore(video, imageElement.nextElementSibling);
  } else {
    // Display regular image
    imageElement.style.display = "block";
    const video = imageElement.nextElementSibling;
    if (video && video.tagName === "VIDEO") {
      video.remove();
    }
    imageElement.src = story.image;
    imageElement.alt = story.title;
  }
  
  modal.style.display = "block";
}

function closeModal() {
  document.getElementById("storyModal").style.display = "none";
}

