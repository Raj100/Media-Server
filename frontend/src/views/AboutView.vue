<!-- <script setup lang="tsx">
import { motion, useScroll } from 'motion-v'
import { defineComponent, ref } from 'vue'


const itemContainer = {
  height: '100vh',
  maxHeight: '400px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}

const progressIconContainer = {
  position: 'sticky',
  top: 0,
  width: '80px',
  height: '80px',
  margin: 0,
  padding: 0,
}

const processCircle = {
  strokeDashoffset: 0,
  strokeWidth: 5,
  fill: 'none',
}

const progressIcon = {
  ...processCircle,
  transform: 'translateX(-100px) rotate(-90deg)',
  stroke: '#ff0088',
}

const progressIconIndicator = {
  ...processCircle,
  strokeDashoffset: 0,
  strokeWidth: 5,
  fill: 'none',
}

const progressIconBg = {
  opacity: 0.2,
}

const item = {
  width: '200px',
  height: '250px',
  border: '2px dotted #ff0088',
  position: 'relative',
}

// Define Item as a separate component
const Item = defineComponent({
  setup() {
    const elementRef = ref(null)
    const { scrollYProgress } = useScroll({
      target: elementRef,
      offset: ['end end', 'start start'],
    })

    return {
      elementRef,
      scrollYProgress,
      itemContainer,
      item,
      progressIconContainer,
      progressIcon,
      progressIconBg,
      progressIconIndicator
    }
  },
  render() {
    return (
      <section style={this.itemContainer}>
        <div ref="elementRef" style={this.item}>
          <figure style={this.progressIconContainer}>
            <svg
              style={this.progressIcon}
              width="75"
              height="75"
              viewBox="0 0 100 100"
            >
              <circle
                style={this.progressIconBg}
                cx="50"
                cy="50"
                r="30"
                pathLength="1"
                class="bg"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="30"
                pathLength="1"
                style={{
                  ...this.progressIconIndicator,
                  pathLength: this.scrollYProgress
                }}
              />
            </svg>
          </figure>
        </div>
      </section>
    )
  }
})
</script>

<template>
  <div>
    <Item v-for="i in 3" :key="i" />
  </div>
</template> -->
