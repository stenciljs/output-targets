<script setup lang="ts">
import { MyComponent, MyButton } from 'component-library-vue'
</script>

<template>
  <MyComponent
    kidsNames="John"
  />
  <my-button fill="ups">Button</my-button>
  <my-button :router-link="{name: 'user', para__ms: {username: 'cindy'}}"></my-button>

  <!-- passing types -->
  <my-button router-link="/">Button</my-button>
  <my-button router-link="/about">
    About
  </my-button>
  <my-button :router-link="{name: 'user', params: {username: 'cindy'}}">
    Cindy
  </my-button>
  <my-button :router-link="{name: 'about'}">
    About
  </my-button>
  <my-button :router-link="{path: '/search', query: {id: 42}}">
    Search for 42
  </my-button>
  <my-button expand="full" :router-link="{name: 'about', hash: '#history'}">
    Our History
  </my-button>
</template>
