<script setup>
import LandsLogo from '@/assets/LandsLogo.vue'
import ButtonMain from '@/components/button/ButtonMain.vue'

defineProps(['showLogin'])
defineEmits(['toggle'])
</script>

<template>
 <header>
   <div class="logo">
     <LandsLogo/>
     <h1>Lands</h1>
   </div>
   <div>
     <ButtonMain 
       :label="showLogin ? 'No account?' : 'Already have an account?'"
       buttonStyle="light"
       @click="$emit('toggle')"
     />
   </div>
 </header>
</template>