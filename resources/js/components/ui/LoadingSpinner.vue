<template>
  <div :class="spinnerClasses"></div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  color: {
    type: String,
    default: 'current'
  }
})

const spinnerClasses = computed(() => {
  const classes = ['loading-spinner']
  
  // Size classes
  switch (props.size) {
    case 'sm':
      classes.push('h-3 w-3')
      break
    case 'md':
      classes.push('h-4 w-4')
      break
    case 'lg':
      classes.push('h-6 w-6')
      break
  }
  
  // Color classes
  if (props.color !== 'current') {
    classes.push(`border-${props.color}-600`)
  }
  
  return classes.join(' ')
})
</script> 