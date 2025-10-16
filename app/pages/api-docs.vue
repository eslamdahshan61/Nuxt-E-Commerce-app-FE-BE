<template>
  <div id="swagger-ui"></div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(async () => {
  const SwaggerUIBundle = (await import('swagger-ui-dist/swagger-ui-bundle.js')).default;
  
  SwaggerUIBundle({
    url: '/api/openapi.json',
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
    ],
    layout: "BaseLayout",
    persistAuthorization: true,
  });

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css';
  document.head.appendChild(link);
});
</script>

<style>
body {
  margin: 0;
  padding: 0;
}

#swagger-ui {
  margin: 0;
  padding: 0;
}
</style>
