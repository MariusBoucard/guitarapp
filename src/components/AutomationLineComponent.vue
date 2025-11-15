<template>
  <div class="automation-container">
    <h3 class="automation-title">{{ $t('section_automation.section_automation_title') }}</h3>

    <!-- Canvas for drawing the automation line -->
    <div class="canvas-container">
      <canvas ref="automationCanvas" @mousedown="startDragging" @dblclick="handleDoubleClick">
      </canvas>
    </div>

    <!-- Section Controls Bar -->
    <div class="section-controls-bar" v-if="activeSectionIndex !== null">
      <div class="active-section-info">
        <span class="section-label">
          {{ $t('section_automation.section') }} {{ activeSectionIndex + 1 }}
        </span>

        <div class="controls-group">
          <div class="control-item">
            <label>{{ $t('section_automation.repetitions') }}:</label>
            <input
              type="number"
              v-model.number="sections[activeSectionIndex].NBReps"
              min="1"
              max="100"
              class="compact-input"
              @change="updateSection"
            />
          </div>

          <div class="control-item">
            <label>{{ $t('section_automation.vitesse') }}:</label>
            <input
              type="number"
              v-model.number="sections[activeSectionIndex].PlaybackRate"
              min="10"
              max="300"
              step="5"
              class="compact-input"
              @change="updateSection"
            />
            <span class="unit">%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Sections Overview -->
    <div class="sections-overview">
      <div
        v-for="(section, index) in sections"
        :key="section.SectionId"
        class="section-pill"
        :class="{ active: index === activeSectionIndex }"
      >
        <span class="section-number">{{ $t('section_automation.section') }} {{ index + 1 }}</span>
        <span class="section-stats">
          {{ section.NBReps }}x&nbsp;•&nbsp;{{ section.PlaybackRate }}
        </span>
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
        isDraggingReps: false,
        activeSectionIndex: null,
        dragStartY: 0,
        dragStartX: 0,
        initialReps: 0,
        sectionWidth: 0, // Will be calculated based on canvas width and number of sections
        defaultPlaybackRate: 100,

        // Canvas drawing properties
        lineColor: '#42b883', // Vue green
        activeColor: '#ff7043',
        gridColor: '#2c3e50',
        backgroundColor: '#1a1a1a',
      }
    },

    beforeDestroy() {
      // Clean up any window event listeners that might still be active
      window.removeEventListener('mousemove', this.handleDrag)
      window.removeEventListener('mouseup', this.stopDragging)
      window.removeEventListener('resize', this.resizeCanvas)
    },

    mounted() {
      this.initializeCanvas()
      window.addEventListener('resize', this.resizeCanvas)
      this.createInitialSections() // Start with 1 section
      this.$nextTick(() => {
        this.drawAutomationLine()
      })
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

      createInitialSections(count = 1) {
        this.sections = Array(count)
          .fill(null)
          .map((_, index) => ({
            SectionId: `section-${index}`,
            SectionNb: index,
            NBReps: 1,
            PlaybackRate: this.defaultPlaybackRate,
          }))
        this.drawAutomationLine()
      },

      addNewSection(x) {
        // Find which section was double-clicked to know where to insert
        const totalReps = this.sections.reduce((sum, s) => sum + s.NBReps, 0)
        const sectionWidths = this.sections.map((s) => (s.NBReps / totalReps) * this.canvasWidth)

        let accumulatedWidth = 0
        let insertIndex = this.sections.length // default to end

        for (let i = 0; i < this.sections.length; i++) {
          if (x >= accumulatedWidth && x < accumulatedWidth + sectionWidths[i]) {
            insertIndex = i + 1
            break
          }
          accumulatedWidth += sectionWidths[i]
        }

        // Insert new section
        this.sections.splice(insertIndex, 0, {
          SectionId: `section-${Date.now()}`,
          SectionNb: insertIndex,
          NBReps: 1,
          PlaybackRate: this.defaultPlaybackRate,
        })

        // Update section numbers
        this.sections.forEach((section, idx) => {
          section.SectionNb = idx
        })

        this.drawAutomationLine()
        this.$emit('automation-updated', this.sections)
      },

      startDragging(event) {
        const canvas = this.$refs.automationCanvas
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top

        // Find which section was clicked using proportional widths
        const sectionIndex = this.getSectionAtPosition(x)
        if (sectionIndex >= 0 && sectionIndex < this.sections.length) {
          // Check if delete button was clicked
          const deleteButtonInfo = this.getDeleteButtonPosition(sectionIndex)
          if (
            x >= deleteButtonInfo.x &&
            x <= deleteButtonInfo.x + 20 &&
            y >= deleteButtonInfo.y &&
            y <= deleteButtonInfo.y + 20
          ) {
            this.deleteSection(sectionIndex)
            return
          }

          this.activeSectionIndex = sectionIndex
          this.drawAutomationLine() // Redraw to show active color

          // Check if we're clicking near the repetition number (bottom of canvas)
          if (y > this.canvasHeight - 25) {
            // 25px from bottom
            this.isDraggingReps = true
            this.dragStartX = event.clientX
            this.initialReps = this.sections[sectionIndex].NBReps

            // Add window event listeners for reps dragging
            window.addEventListener('mousemove', this.handleRepsDrag)
            window.addEventListener('mouseup', this.stopDragging)
            return
          }

          // Only start dragging if not clicking delete button or reps
          this.isDragging = true
          this.dragStartY = event.clientY

          // Store initial playback rate
          this.initialPlaybackRate = this.sections[sectionIndex].PlaybackRate

          // Add window event listeners for playback rate dragging
          window.addEventListener('mousemove', this.handleDrag)
          window.addEventListener('mouseup', this.stopDragging)
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

      handleRepsDrag(event) {
        if (!this.isDraggingReps || this.activeSectionIndex === null) return

        const deltaX = event.clientX - this.dragStartX
        // Each 10 pixels of movement changes reps by 1
        const repsChange = Math.round(deltaX / 5)

        // Update reps with constraints
        let newReps = this.initialReps + repsChange
        newReps = Math.max(1, Math.min(100, newReps)) // Limit between 1 and 100

        this.sections[this.activeSectionIndex].NBReps = newReps
        this.drawAutomationLine()

        // Emit change event
        this.$emit('automation-updated', this.sections)
      },

      stopDragging() {
        if (this.isDragging) {
          this.isDragging = false
          window.removeEventListener('mousemove', this.handleDrag)
          window.removeEventListener('mouseup', this.stopDragging)
        }
        if (this.isDraggingReps) {
          this.isDraggingReps = false
          window.removeEventListener('mousemove', this.handleRepsDrag)
          window.removeEventListener('mouseup', this.stopDragging)
        }
        // Keep the active section selected for the info panel
      },

      updateSection() {
        this.drawAutomationLine()
        this.$emit('automation-updated', this.sections)
      },

      handleDoubleClick(event) {
        const canvas = this.$refs.automationCanvas
        const rect = canvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        this.addNewSection(x)
      },

      getXPositionForSection(sectionIndex) {
        // Calculate x position based on proportional widths
        const totalReps = this.sections.reduce((sum, s) => sum + s.NBReps, 0)
        let accumulatedWidth = 0

        for (let i = 0; i < sectionIndex; i++) {
          accumulatedWidth += (this.sections[i].NBReps / totalReps) * this.canvasWidth
        }

        // Return center point of the section
        return (
          accumulatedWidth +
          ((this.sections[sectionIndex].NBReps / totalReps) * this.canvasWidth) / 2
        )
      },

      getSectionAtPosition(x) {
        const totalReps = this.sections.reduce((sum, s) => sum + s.NBReps, 0)
        let accumulatedWidth = 0

        for (let i = 0; i < this.sections.length; i++) {
          const sectionWidth = (this.sections[i].NBReps / totalReps) * this.canvasWidth
          if (x >= accumulatedWidth && x < accumulatedWidth + sectionWidth) {
            return i
          }
          accumulatedWidth += sectionWidth
        }

        return this.sections.length - 1
      },

      drawAutomationLine() {
        const canvas = this.$refs.automationCanvas
        const ctx = canvas.getContext('2d')

        // Clear canvas
        ctx.fillStyle = this.backgroundColor
        ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)

        // Draw grid
        this.drawGrid(ctx)

        const totalReps = this.sections.reduce((sum, s) => sum + s.NBReps, 0)
        let accumulatedWidth = 0

        // Draw sections
        this.sections.forEach((section, index) => {
          const sectionWidth = (section.NBReps / totalReps) * this.canvasWidth
          const x = accumulatedWidth
          const y = this.getYPosition(section.PlaybackRate)

          // Draw horizontal bar
          const barHeight = 4
          ctx.fillStyle = index === this.activeSectionIndex ? this.activeColor : this.lineColor
          ctx.fillRect(x, y - barHeight / 2, sectionWidth, barHeight)

          // Add highlight effect on top of the bar
          const gradient = ctx.createLinearGradient(x, y - barHeight / 2, x, y + barHeight / 2)
          gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)')
          gradient.addColorStop(1, 'rgba(255, 255, 255, 0)')
          ctx.fillStyle = gradient
          ctx.fillRect(x, y - barHeight / 2, sectionWidth, barHeight)

          // Draw delete button (cross)
          if (this.sections.length > 1) {
            // Only show delete button if there's more than one section
            const deletePos = this.getDeleteButtonPosition(index)
            ctx.fillStyle =
              index === this.activeSectionIndex ? this.activeColor : 'rgba(255, 255, 255, 0.5)'

            // Draw circle background
            ctx.beginPath()
            ctx.arc(deletePos.x + 10, deletePos.y + 10, 8, 0, Math.PI * 2)
            ctx.fill()

            // Draw cross
            ctx.strokeStyle = this.backgroundColor
            ctx.lineWidth = 2
            ctx.beginPath()
            // First line of cross
            ctx.moveTo(deletePos.x + 7, deletePos.y + 7)
            ctx.lineTo(deletePos.x + 13, deletePos.y + 13)
            // Second line of cross
            ctx.moveTo(deletePos.x + 13, deletePos.y + 7)
            ctx.lineTo(deletePos.x + 7, deletePos.y + 13)
            ctx.stroke()
          }

          // Draw repetition count with draggable indicator
          const isActive = index === this.activeSectionIndex

          // Draw background pill for reps
          ctx.fillStyle = isActive ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)'
          const textWidth = 40
          const textHeight = 20
          const textX = x + sectionWidth / 2 - textWidth / 2
          const textY = this.canvasHeight - textHeight - 5

          // Rounded rectangle for background
          ctx.beginPath()
          ctx.roundRect(textX, textY, textWidth, textHeight, 5)
          ctx.fill()

          // Draw grip lines to indicate draggable
          if (isActive) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)'
            ctx.lineWidth = 1
            const gripX = textX + 5
            for (let i = 0; i < 3; i++) {
              ctx.beginPath()
              ctx.moveTo(gripX + i * 4, textY + 5)
              ctx.lineTo(gripX + i * 4, textY + textHeight - 5)
              ctx.stroke()
            }
          }

          // Draw repetition count
          ctx.fillStyle = isActive ? '#fff' : 'rgba(255, 255, 255, 0.8)'
          ctx.font = isActive ? 'bold 12px Arial' : '12px Arial'
          ctx.textAlign = 'center'
          ctx.fillText(`${section.NBReps}×`, x + sectionWidth / 2, this.canvasHeight - 8)

          accumulatedWidth += sectionWidth
        })

        // Draw section separators
        this.drawSectionSeparators(ctx)

        // Draw connecting lines between bars
        accumulatedWidth = 0
        ctx.beginPath()
        ctx.strokeStyle = this.lineColor
        ctx.lineWidth = 1

        this.sections.forEach((section, index) => {
          const sectionWidth = (section.NBReps / totalReps) * this.canvasWidth
          const x = accumulatedWidth + sectionWidth
          const y = this.getYPosition(section.PlaybackRate)

          if (index < this.sections.length - 1) {
            const nextY = this.getYPosition(this.sections[index + 1].PlaybackRate)
            ctx.beginPath()
            ctx.moveTo(x, y)
            ctx.lineTo(x, nextY)
            ctx.stroke()
          }

          accumulatedWidth += sectionWidth
        })
      },

      drawSectionSeparators(ctx) {
        const totalReps = this.sections.reduce((sum, s) => sum + s.NBReps, 0)
        let accumulatedWidth = 0

        ctx.strokeStyle = this.gridColor
        ctx.lineWidth = 0.5
        ctx.setLineDash([5, 5])

        this.sections.forEach((section, index) => {
          if (index < this.sections.length - 1) {
            const x = accumulatedWidth + (section.NBReps / totalReps) * this.canvasWidth
            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, this.canvasHeight)
            ctx.stroke()
          }
          accumulatedWidth += (section.NBReps / totalReps) * this.canvasWidth
        })

        ctx.setLineDash([]) // Reset line style
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
        return this.canvasHeight - (rate / 300) * this.canvasHeight
      },

      getDeleteButtonPosition(sectionIndex) {
        const totalReps = this.sections.reduce((sum, s) => sum + s.NBReps, 0)
        let accumulatedWidth = 0

        for (let i = 0; i < sectionIndex; i++) {
          accumulatedWidth += (this.sections[i].NBReps / totalReps) * this.canvasWidth
        }

        const sectionWidth = (this.sections[sectionIndex].NBReps / totalReps) * this.canvasWidth
        return {
          x: accumulatedWidth + sectionWidth - 25, // 25px from right edge
          y: 5, // 5px from top
        }
      },

      deleteSection(index) {
        if (this.sections.length > 1) {
          // Don't delete if it's the last section
          this.sections.splice(index, 1)
          if (this.activeSectionIndex === index) {
            this.activeSectionIndex = null
          } else if (this.activeSectionIndex > index) {
            this.activeSectionIndex--
          }
          this.drawAutomationLine()
          this.$emit('automation-updated', this.sections)
        }
      },
    },
  }
</script>

<style scoped>
  .automation-container {
    padding: 20px;
    background: var(--bg-primary);
    border-radius: var(--border-radius);
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    gap: 15px;
  }

  .automation-title {
    color: var(--text-primary);
    margin: 0;
    font-size: 1.1rem;
  }

  .canvas-container {
    position: relative;
    width: 100%;
    height: 200px; /* Increased height */
    background: var(--bg-secondary);
    border-radius: var(--border-radius);
    overflow: hidden;
  }

  canvas {
    width: 100%;
    height: 100%;
    cursor: pointer;
  }

  /* Section Controls Bar */
  .section-controls-bar {
    background: var(--bg-secondary);
    border-radius: var(--border-radius);
    padding: 8px 12px;
    margin-top: -10px; /* Overlap with canvas */
  }

  .active-section-info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .section-label {
    font-weight: 500;
    color: var(--text-primary);
    min-width: 100px;
  }

  .controls-group {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .control-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .control-item label {
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .compact-input {
    width: 60px;
    padding: 4px 8px;
    border: 1px solid var(--border-primary);
    border-radius: var(--border-radius);
    background: var(--bg-input);
    color: var(--text-primary);
    font-size: 0.9rem;
    text-align: right;
  }

  .unit {
    color: var(--text-secondary);
    font-size: 0.9rem;
    min-width: 20px;
  }

  /* Sections Overview */
  .sections-overview {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    padding: 8px;
    background: var(--bg-secondary);
    border-radius: var(--border-radius);
  }

  .section-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 4px 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    font-size: 0.85rem;
    color: var(--text-secondary);
    transition: all 0.2s ease;
  }

  .section-pill.active {
    background: var(--bg-accent);
    color: var(--text-accent);
  }

  .section-number {
    font-weight: 500;
  }

  .section-stats {
    opacity: 0.8;
  }
</style>
