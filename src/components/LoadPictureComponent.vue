<template>
  <div class="picture-loader-container">
    <div class="section-card">
      <h3 class="section-title">Picture Gallery</h3>
      <p class="text-center" style="color: var(--text-secondary); margin-bottom: 25px">
        Upload and view your guitar chord diagrams and images
      </p>
    </div>

    <!-- Upload Section -->
    <div class="section-card">
      <div
        class="upload-area"
        :class="{ dragover: isDragOver }"
        @click="triggerFileInput"
        @drop="handleDrop"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @dragenter.prevent
      >
        <div class="upload-content">
          <div class="upload-icon">📷</div>
          <p class="upload-text">Drop images here or click to browse</p>
          <button class="btn btn-primary" @click.stop="triggerFileInput">
            <span class="button-icon">📁</span>
            Choose File
          </button>
          <input
            ref="fileInput"
            id="uploadpic"
            type="file"
            accept="image/*"
            @change="handleFileChange"
            class="file-input"
          />
        </div>
      </div>
    </div>

    <!-- Pictures Grid -->
    <div class="section-card" v-if="picturesPath.length > 0">
      <div class="flex-between mb-medium">
        <h4 style="margin: 0; color: var(--text-primary); font-size: 1.3rem; font-weight: 600">
          Your Images ({{ picturesPath.length }})
        </h4>
        <button class="btn btn-danger-alt btn-small" @click="clearAllPictures">
          <span class="clear-icon">🗑️</span>
          Clear All
        </button>
      </div>

      <div class="pictures-grid">
        <div
          v-for="(item, index) in picturesPath"
          :key="index"
          class="picture-card"
          :class="{ active: selectedPicture === index }"
          @click="launchFile(item, index)"
        >
          <div class="picture-thumbnail">
            <img :src="getImagePreview(item)" alt="Picture thumbnail" />
          </div>
          <div class="picture-info">
            <span class="picture-name">{{ formatFileName(item.name) }}</span>
            <button class="btn-icon-round btn-danger" @click.stop="removePicture(index)"></button>
          </div>
        </div>
      </div>
    </div>

    <!-- No Pictures State -->
    <div class="no-content-message" v-else>
      <div class="empty-icon">🖼️</div>
      <p class="empty-message">No images uploaded yet</p>
      <p class="empty-hint">Upload your first image to get started</p>
    </div>

    <!-- Image Display -->
    <div class="section-card" v-if="imageUrl">
      <div class="flex-between mb-medium">
        <h4 style="margin: 0; color: var(--text-primary); font-size: 1.3rem; font-weight: 600">
          Current Image
        </h4>
        <button
          class="btn-icon-round"
          style="background: #95a5a6; color: white"
          @click="closeImage"
        ></button>
      </div>

      <div class="image-container">
        <img :src="imageUrl" alt="Selected image" class="display-image" />
      </div>
    </div>
  </div>
</template>

<script>
  import { ref } from 'vue'
  import { usePictureStore } from '../stores/pictureStore'

  export default {
    setup() {
      const pictureStore = usePictureStore()
      const fileInput = ref(null)

      return {
        pictureStore,
        fileInput,
      }
    },

    data() {
      return {
        isDragOver: false,
      }
    },

    computed: {
      picturesPath() {
        return this.pictureStore.pictureList
      },

      imageUrl() {
        return this.pictureStore.currentImageUrl
      },

      selectedPicture() {
        return this.pictureStore.selectedPictureIndex
      },
    },
    methods: {
      triggerFileInput() {
        if (this.fileInput) {
          this.fileInput.click()
        }
      },

      handleDrop(event) {
        event.preventDefault()
        this.isDragOver = false

        const files = Array.from(event.dataTransfer.files)
        files.forEach((file) => {
          if (file.type.startsWith('image/')) {
            this.addPicture(file)
          }
        })
      },

      launchFile(picture, index) {
        this.pictureStore.selectPicture(index)
      },

      handleFileChange(event) {
        const file = event.target.files[0]
        if (!file || !file.type.startsWith('image/')) {
          return
        }
        this.addPicture(file)
        // Reset input value to allow selecting same file again
        event.target.value = ''
      },

      addPicture(file) {
        // Convert file to base64 data URL
        const reader = new FileReader()
        reader.onload = () => {
          const pictureData = {
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            dataUrl: reader.result,
          }

          const added = this.pictureStore.addPicture(pictureData)
          if (added) {
            // Auto-select and display the newly added picture
            const newIndex = this.pictureStore.pictureList.length - 1
            this.pictureStore.selectPicture(newIndex)
          }
        }
        reader.readAsDataURL(file)
      },

      removePicture(index) {
        this.pictureStore.removePicture(index)
      },

      clearAllPictures() {
        this.pictureStore.clearAllPictures()
      },

      closeImage() {
        this.pictureStore.clearSelection()
      },

      formatFileName(name) {
        if (name.length > 20) {
          const ext = name.substring(name.lastIndexOf('.'))
          return name.substring(0, 17) + '...' + ext
        }
        return name
      },

      getImagePreview(picture) {
        return this.pictureStore.getImagePreview(picture.name)
      },
    },
  }
</script>

<style scoped>
  .picture-loader-container {
    width: 100%;
    max-width: 900px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--gap-large, 25px);
  }

  /* Upload Area Styles */
  .upload-area {
    border: 2px dashed var(--border-secondary, #bdc3c7);
    border-radius: var(--border-radius);
    padding: 40px 20px;
    text-align: center;
    background: var(--bg-white-semi);
    transition: var(--transition-medium);
    cursor: pointer;
  }

  .upload-area:hover,
  .upload-area.dragover {
    border-color: var(--primary-color);
    background: var(--bg-primary-light);
    transform: translateY(-2px);
    box-shadow: 0 8px 25px var(--bg-primary-border-light);
  }

  .upload-icon {
    font-size: 3rem;
    margin-bottom: 15px;
    opacity: 0.7;
  }

  .upload-text {
    margin: 0 0 20px 0;
    color: var(--text-secondary);
    font-size: 1.1rem;
  }

  .button-icon {
    font-size: 1.1rem;
    margin-right: 8px;
  }

  .file-input {
    display: none;
  }

  /* Pictures Grid */
  .pictures-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 15px;
    margin-top: 15px;
  }

  .picture-card {
    background: var(--bg-white-translucent);
    border-radius: var(--border-radius);
    overflow: hidden;
    cursor: pointer;
    transition: var(--transition-medium);
    box-shadow: var(--shadow-card);
    border: 2px solid transparent;
  }

  .picture-card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-hover);
    border-color: var(--primary-color);
  }

  .picture-card.active {
    border-color: var(--primary-color);
    box-shadow: 0 8px 25px var(--bg-primary-border-light);
  }

  .picture-thumbnail {
    width: 100%;
    height: 120px;
    overflow: hidden;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .picture-thumbnail img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: var(--transition-medium);
  }

  .picture-card:hover .picture-thumbnail img {
    transform: scale(1.05);
  }

  .picture-info {
    padding: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .picture-name {
    color: var(--text-primary);
    font-weight: 500;
    font-size: 0.9rem;
    flex: 1;
    text-align: left;
  }

  /* Empty State Styling */
  .empty-icon {
    font-size: 4rem;
    margin-bottom: 15px;
    opacity: 0.5;
  }

  .empty-message {
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: var(--text-secondary);
  }

  .empty-hint {
    margin: 0;
    font-size: 1rem;
    opacity: 0.8;
    color: var(--text-secondary);
  }

  /* Image Display */
  .image-container {
    background: var(--bg-white-translucent);
    border-radius: var(--border-radius);
    padding: 15px;
    text-align: center;
    box-shadow: var(--shadow-card);
  }

  .display-image {
    max-width: 100%;
    max-height: 400px;
    border-radius: 8px;
    box-shadow: var(--shadow-card);
  }

  /* Responsive Design */
  @media (max-width: 768px) {
    .picture-loader-container {
      width: 95%;
      margin: 10px auto;
    }

    .pictures-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
    }

    .upload-area {
      padding: 30px 15px;
    }
  }
</style>
