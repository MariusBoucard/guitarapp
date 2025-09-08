<template>
  <div class="picture-loader-container">
    <div class="header-section">
      <h3 class="title">Picture Gallery</h3>
      <p class="subtitle">Upload and view your guitar chord diagrams and images</p>
    </div>

    <!-- Upload Section -->
    <div class="upload-section">
      <div class="upload-area" :class="{ 'dragover': isDragOver }" 
           @drop="handleDrop" 
           @dragover.prevent="isDragOver = true" 
           @dragleave="isDragOver = false"
           @dragenter.prevent>
        <div class="upload-content">
          <div class="upload-icon">📷</div>
          <p class="upload-text">Drop images here or click to browse</p>
          <button class="upload-button" @click="triggerFileInput">
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
          >
        </div>
      </div>
    </div>

    <!-- Pictures Grid -->
    <div class="pictures-section" v-if="picturesPath.length > 0">
      <div class="section-header">
        <h4 class="section-title">Your Images ({{ picturesPath.length }})</h4>
        <button class="clear-all-btn" @click="clearAllPictures" v-if="picturesPath.length > 0">
          <span class="clear-icon">🗑️</span>
          Clear All
        </button>
      </div>
      
      <div class="pictures-grid">
        <div 
          v-for="(item, index) in picturesPath" 
          :key="index"
          class="picture-card"
          :class="{ 'active': selectedPicture === index }"
          @click="launchFile(item, index)"
        >
          <div class="picture-thumbnail">
            <img :src="getImagePreview(item)" alt="Picture thumbnail" />
          </div>
          <div class="picture-info">
            <span class="picture-name">{{ formatFileName(item.name) }}</span>
            <button class="remove-btn" @click.stop="removePicture(index)">
              <span class="remove-icon">✕</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- No Pictures State -->
    <div class="no-pictures-state" v-else>
      <div class="empty-icon">🖼️</div>
      <p class="empty-message">No images uploaded yet</p>
      <p class="empty-hint">Upload your first image to get started</p>
    </div>

    <!-- Image Display -->
    <div class="image-display-section" v-if="imageUrl">
      <div class="section-header">
        <h4 class="section-title">Current Image</h4>
        <button class="close-btn" @click="closeImage">
          <span class="close-icon">✕</span>
        </button>
      </div>
      
      <div class="image-container">
        <img :src="imageUrl" alt="Selected image" class="display-image" />
      </div>
    </div>
  </div>
</template>
  
<script>
export default {
  data() {
    return {
      imageUrl: '',
      picturesPath: [],
      selectedPicture: null,
      isDragOver: false,
      imageCache: new Map() // Cache for image previews
    };
  },
  methods: {
    triggerFileInput() {
      this.$refs.fileInput.click();
    },
    
    handleDrop(event) {
      event.preventDefault();
      this.isDragOver = false;
      
      const files = Array.from(event.dataTransfer.files);
      files.forEach(file => {
        if (file.type.startsWith('image/')) {
          this.addPicture(file);
        }
      });
    },
    
    launchFile(file, index) {
      this.selectedPicture = index;
      
      if (this.imageCache.has(file.name)) {
        this.imageUrl = this.imageCache.get(file.name);
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result;
        this.imageCache.set(file.name, reader.result);
      };
      reader.readAsDataURL(file);
    },
    
    handleFileChange(event) {
      const file = event.target.files[0];
      if (!file || !file.type.startsWith('image/')) {
        return;
      }
      this.addPicture(file);
      // Reset input value to allow selecting same file again
      event.target.value = '';
    },
    
    addPicture(file) {
      // Check if file already exists
      const exists = this.picturesPath.some(pic => 
        pic.name === file.name && pic.size === file.size
      );
      
      if (!exists) {
        this.picturesPath.push(file);
        // Auto-select and display the newly added picture
        const newIndex = this.picturesPath.length - 1;
        this.launchFile(file, newIndex);
      }
    },
    
    removePicture(index) {
      const removedFile = this.picturesPath[index];
      this.picturesPath.splice(index, 1);
      
      // Clear cache for removed file
      this.imageCache.delete(removedFile.name);
      
      // If removed picture was selected, clear or select another
      if (this.selectedPicture === index) {
        if (this.picturesPath.length > 0) {
          const newIndex = Math.min(index, this.picturesPath.length - 1);
          this.launchFile(this.picturesPath[newIndex], newIndex);
        } else {
          this.imageUrl = '';
          this.selectedPicture = null;
        }
      } else if (this.selectedPicture > index) {
        this.selectedPicture--;
      }
    },
    
    clearAllPictures() {
      this.picturesPath = [];
      this.imageUrl = '';
      this.selectedPicture = null;
      this.imageCache.clear();
    },
    
    closeImage() {
      this.imageUrl = '';
      this.selectedPicture = null;
    },
    
    formatFileName(name) {
      if (name.length > 20) {
        const ext = name.substring(name.lastIndexOf('.'));
        return name.substring(0, 17) + '...' + ext;
      }
      return name;
    },
    
    getImagePreview(file) {
      if (this.imageCache.has(file.name)) {
        return this.imageCache.get(file.name);
      }
      
      // Create preview asynchronously
      const reader = new FileReader();
      reader.onload = () => {
        this.imageCache.set(file.name, reader.result);
        this.$forceUpdate(); // Trigger re-render to show preview
      };
      reader.readAsDataURL(file);
      
      // Return placeholder while loading
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjVmNWY1Ii8+CjxwYXRoIGQ9Ik0yMCAyNUwyNSAxNUgxNUwyMCAyNVoiIGZpbGw9IiNjY2MiLz4KPC9zdmc+';
    }
  },
};
</script>

<style scoped>
.picture-loader-container {
  width: 900px;
  min-width: 900px;
  max-width: 900px;
  margin: 20px auto;
  padding: 25px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.header-section {
  text-align: center;
  margin-bottom: 25px;
}

.title {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1.8rem;
  font-weight: 600;
}

.subtitle {
  margin: 0;
  color: #7f8c8d;
  font-size: 1rem;
  font-weight: 400;
}

/* Upload Section */
.upload-section {
  margin-bottom: 25px;
}

.upload-area {
  border: 2px dashed #bdc3c7;
  border-radius: 12px;
  padding: 40px 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover, .upload-area.dragover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.15);
}

.upload-content {
  pointer-events: none;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 15px;
  opacity: 0.7;
}

.upload-text {
  margin: 0 0 20px 0;
  color: #5a6c7d;
  font-size: 1.1rem;
}

.upload-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  pointer-events: all;
}

.upload-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.button-icon {
  font-size: 1.1rem;
}

.file-input {
  display: none;
}

/* Section Headers */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-title {
  margin: 0;
  color: #2c3e50;
  font-size: 1.3rem;
  font-weight: 600;
}

.clear-all-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 3px 10px rgba(255, 107, 107, 0.3);
}

.clear-all-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(255, 107, 107, 0.4);
}

.clear-icon {
  font-size: 1rem;
}

/* Pictures Grid */
.pictures-section {
  margin-bottom: 25px;
}

.pictures-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 15px;
}

.picture-card {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
}

.picture-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #667eea;
}

.picture-card.active {
  border-color: #667eea;
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.25);
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
  transition: transform 0.3s ease;
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
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
  flex: 1;
  text-align: left;
}

.remove-btn {
  background: #e74c3c;
  color: white;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #c0392b;
  transform: scale(1.1);
}

/* No Pictures State */
.no-pictures-state {
  text-align: center;
  padding: 40px 20px;
  color: #7f8c8d;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 15px;
  opacity: 0.5;
}

.empty-message {
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.empty-hint {
  margin: 0;
  font-size: 1rem;
  opacity: 0.8;
}

/* Image Display */
.image-display-section {
  margin-top: 25px;
}

.close-btn {
  background: #95a5a6;
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #7f8c8d;
  transform: scale(1.1);
}

.image-container {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.display-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

/* Responsive Design */
@media (max-width: 768px) {
  .picture-loader-container {
    width: 95%;
    min-width: unset;
    max-width: unset;
    margin: 10px auto;
    padding: 15px;
  }

  .pictures-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }

  .title {
    font-size: 1.5rem;
  }

  .upload-area {
    padding: 30px 15px;
  }
}
</style>