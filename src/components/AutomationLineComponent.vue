<template>
  <div class="automation-container">
    <h3 class="automation-title">Section Automation</h3>
    
    <!-- Canvas for drawing the automation line -->
    <div class="canvas-container">
      <canvas 
        ref="automationCanvas"
        @mousedown="startDragging"
        @mousemove="handleDrag"
        @mouseup="stopDragging"
        @mouseleave="stopDragging">
      </canvas>
      
      <!-- Section info overlay -->
      <div v-if="activeSectionIndex !== null" class="section-info">
        <div class="section-controls">
          <label>Section {{ activeSectionIndex + 1 }}</label>
          <div class="control-group">
            <label>Repetitions:</label>
            <input 
              type="number" 
              v-model.number="sections[activeSectionIndex].NBReps" 
              min="1" 
              max="100"
              @change="updateSection">
          </div>
          <div class="control-group">
            <label>Playback Rate:</label>
            <input 
              type="number" 
              v-model.number="sections[activeSectionIndex].PlaybackRate" 
              min="10" 
              max="300"
              step="5"
              @change="updateSection">
            <span>%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Section list -->
    <div class="sections-list">
      <div v-for="(section, index) in sections" 
           :key="section.SectionId"
           class="section-item"
           :class="{ 'active': index === activeSectionIndex }">
        <span>Section {{ index + 1 }}</span>
        <span>{{ section.NBReps }}x @ {{ section.PlaybackRate }}%</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AutomationLineComponent',
  
  data() {
    return {
      sections: [],
      canvasWidth: 800,
      canvasHeight: 200,
      isDragging: false,
      activeSectionIndex: null,
      dragStartY: 0,
      sectionWidth: 0, // Will be calculated based on canvas width and number of sections
      defaultPlaybackRate: 100,
      
      // Canvas drawing properties
      lineColor: '#42b883', // Vue green
      activeColor: '#ff7043',
      gridColor: '#2c3e50',
      backgroundColor: '#1a1a1a'
    }
  },

  mounted() {
    this.initializeCanvas()
    window.addEventListener('resize', this.resizeCanvas)
    this.createInitialSections(8) // Start with 8 sections
  },

  beforeDestroy() {
    window.removeEventListener('resize', this.resizeCanvas)
  },

  methods: {
    initializeCanvas() {
      const canvas = this.$refs.automationCanvas
      const container = canvas.parentElement
      
      // Set canvas size to match container
      this.canvasWidth = container.clientWidth
      this.canvasHeight = container.clientHeight
      canvas.width = this.canvasWidth
      canvas.height = this.canvasHeight
      
      // Calculate section width
      this.sectionWidth = this.canvasWidth / this.sections.length
      
      this.drawAutomationLine()
    },

    resizeCanvas() {
      this.initializeCanvas()
    },

    createInitialSections(count) {
      this.sections = Array(count).fill(null).map((_, index) => ({
        SectionId: `section-${index}`,
        SectionNb: index,
        NBReps: 1,
        PlaybackRate: this.defaultPlaybackRate
      }))
      this.drawAutomationLine()
    },

    startDragging(event) {
      const canvas = this.$refs.automationCanvas
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      
      // Calculate which section was clicked
      const sectionIndex = Math.floor(x / this.sectionWidth)
      if (sectionIndex >= 0 && sectionIndex < this.sections.length) {
        this.isDragging = true
        this.activeSectionIndex = sectionIndex
        this.dragStartY = event.clientY
        
        // Store initial playback rate
        this.initialPlaybackRate = this.sections[sectionIndex].PlaybackRate
      }
    },

    handleDrag(event) {
      if (!this.isDragging || this.activeSectionIndex === null) return
      
      const deltaY = this.dragStartY - event.clientY
      const rateChange = Math.round(deltaY / 2) // 1 pixel = 0.5% change
      
      // Update playback rate with constraints
      let newRate = this.initialPlaybackRate + rateChange
      newRate = Math.max(10, Math.min(300, newRate))
      
      this.sections[this.activeSectionIndex].PlaybackRate = newRate
      this.drawAutomationLine()
      
      // Emit change event
      this.$emit('automation-updated', this.sections)
    },

    stopDragging() {
      this.isDragging = false
      // Keep the active section selected for the info panel
    },

    updateSection() {
      this.drawAutomationLine()
      this.$emit('automation-updated', this.sections)
    },

    drawAutomationLine() {
      const canvas = this.$refs.automationCanvas
      const ctx = canvas.getContext('2d')
      
      // Clear canvas
      ctx.fillStyle = this.backgroundColor
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
      
      // Draw grid
      this.drawGrid(ctx)
      
      // Draw automation line
      ctx.beginPath()
      ctx.strokeStyle = this.lineColor
      ctx.lineWidth = 2
      
      this.sections.forEach((section, index) => {
        const x = (index + 0.5) * this.sectionWidth
        const y = this.getYPosition(section.PlaybackRate)
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
        
        // Draw point
        ctx.fillStyle = index === this.activeSectionIndex ? this.activeColor : this.lineColor
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fill()
      })
      
      ctx.stroke()
    },

    drawGrid(ctx) {
      ctx.strokeStyle = this.gridColor
      ctx.lineWidth = 0.5
      
      // Draw horizontal lines (playback rate indicators)
      for (let rate = 0; rate <= 300; rate += 50) {
        const y = this.getYPosition(rate)
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(this.canvasWidth, y)
        ctx.stroke()
        
        // Draw rate label
        ctx.fillStyle = '#fff'
        ctx.font = '12px Arial'
        ctx.fillText(`${rate}%`, 5, y - 5)
      }
      
      // Draw vertical lines (section separators)
      for (let i = 0; i <= this.sections.length; i++) {
        const x = i * this.sectionWidth
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, this.canvasHeight)
        ctx.stroke()
      }
    },

    getYPosition(rate) {
      // Convert playback rate to Y position (inverted, since canvas Y goes down)
      return this.canvasHeight - (rate / 300 * this.canvasHeight)
    }
  }
}
</script>

<style scoped>
.automation-container {
  padding: 20px;
  background: var(--bg-primary);
  border-radius: var(--border-radius);
  margin: 20px 0;
}

.automation-title {
  color: var(--text-primary);
  margin-bottom: 15px;
}

.canvas-container {
  position: relative;
  width: 100%;
  height: 200px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  overflow: hidden;
}

canvas {
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.section-info {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  padding: 10px;
  border-radius: var(--border-radius);
  color: var(--text-primary);
}

.section-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-group input {
  width: 60px;
  padding: 4px;
  border: 1px solid var(--border-primary);
  border-radius: var(--border-radius);
  background: var(--bg-input);
  color: var(--text-primary);
}

.sections-list {
  margin-top: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.section-item {
  padding: 8px 12px;
  background: var(--bg-secondary);
  border-radius: var(--border-radius);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.9rem;
}

.section-item.active {
  background: var(--bg-accent);
  color: var(--text-accent);
}
</style>