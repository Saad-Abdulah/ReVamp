<template>
  <div :class="cardClasses">
    <div v-if="$slots.header || title" :class="headerClasses">
      <slot name="header">
        <h3 v-if="title" class="text-lg font-medium text-gray-900">
          {{ title }}
        </h3>
      </slot>
    </div>
    
    <div :class="bodyClasses">
      <slot />
    </div>
    
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'bordered', 'shadow'].includes(value)
  },
  padding: {
    type: String,
    default: 'default',
    validator: (value) => ['none', 'sm', 'default', 'lg'].includes(value)
  }
})

const cardClasses = computed(() => {
  const classes = ['card']
  
  if (props.variant === 'bordered') {
    classes.push('border-2')
  } else if (props.variant === 'shadow') {
    classes.push('shadow-lg')
  }
  
  return classes.join(' ')
})

const headerClasses = computed(() => {
  return 'card-header'
})

const bodyClasses = computed(() => {
  const classes = []
  
  switch (props.padding) {
    case 'none':
      // No padding
      break
    case 'sm':
      classes.push('p-4')
      break
    case 'lg':
      classes.push('p-8')
      break
    default:
      classes.push('card-body')
  }
  
  return classes.join(' ')
})
</script> 