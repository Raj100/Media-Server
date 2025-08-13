<template>
  <div class="home">
    <Navbar />
    
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">Your Media, Your Way.</h1>
        <p class="hero-subtitle">Dive into a world of entertainment at your fingertips.</p>
        
        <div class="hero-actions">
          <router-link to="/movies" class="cta-button primary">Browse Movies</router-link>
          <router-link to="/music" class="cta-button secondary">Explore Music</router-link>
          <router-link to="/dashboard" class="cta-button tertiary">My Collection</router-link>
        </div>
      </div>
      
      <div class="hero-visual">
        <div class="media-grid">
          <div class="media-card" v-for="i in 6" :key="i">
            <img :src="`/placeholder.svg?height=200&width=150&query=movie poster ${i}`" :alt="`Movie ${i}`" />
          </div>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">Everything You Need</h2>
        
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">🎬</div>
            <h3>Movies & Shows</h3>
            <p>Stream your favorite movies and TV shows in high quality</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">🎵</div>
            <h3>Music Library</h3>
            <p>Organize and play your music collection with ease</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">💬</div>
            <h3>Chat & Share</h3>
            <p>Connect with family and friends about your favorite content</p>
          </div>
          
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Mobile Friendly</h3>
            <p>Access your media anywhere, on any device</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import Navbar from '../components/Navbar.vue'
</script>

<style scoped>
.home {
  min-height: 100vh;
}

.hero {
  padding: 4rem 1rem;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #581c87, #a855f7);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  opacity: 0.8;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.cta-button {
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
  display: inline-block;
}

.cta-button.primary {
  background: linear-gradient(135deg, #581c87, #a855f7);
  color: white;
}

.cta-button.secondary {
  background: rgba(168, 85, 247, 0.1);
  color: #581c87;
  border: 2px solid #a855f7;
}

.cta-button.tertiary {
  background: transparent;
  color: #581c87;
  border: 2px solid #581c87;
}

.cta-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(88, 28, 135, 0.3);
}

.hero-visual {
  position: relative;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  transform: rotate(5deg);
}

.media-card {
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.media-card:hover {
  transform: scale(1.05);
}

.media-card img {
  width: 100%;
  height: auto;
  display: block;
}

.features {
  padding: 4rem 1rem;
  background: rgba(168, 85, 247, 0.05);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 3rem;
  color: #581c87;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.dark .feature-card {
  background: #2a2a2a;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 30px rgba(88, 28, 135, 0.2);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #581c87;
}

.dark .feature-card h3 {
  color: #a855f7;
}

.feature-card p {
  opacity: 0.8;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    gap: 2rem;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .hero-actions {
    justify-content: center;
  }
  
  .cta-button {
    padding: 0.75rem 1.5rem;
  }
  
  .media-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
