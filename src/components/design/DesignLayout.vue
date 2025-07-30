<template>
  <ul class="item">
    <li>
      <div class="icon">
        qwe
      </div>
      <div class="content">
        <h3>Layout</h3>
        <p>Adjust spacing and sizes</p>
      </div>
      <div class="actions">
        <button>+</button>
      </div>
    </li>
  </ul>
</template>

<style scoped>
ul.item {
  display: flex;
  flex-direction: column;
  gap: 1em;
  
  li {
    display: grid;
    grid-template-columns: 0.15fr 1fr 0.15fr;
    align-items: center;
    gap: 1em;
    cursor: pointer;
    padding: .5em;
    border-radius: 1.5em;
    border: 1px solid var(--border);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    
    > .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1;
      border: 1px solid var(--border);
      border-radius: 1em;
      background: var(--bg);
    }
    
    > .content {
      display: flex;
      flex-direction: column;
      gap: .5em;
      
      > p {
        color: var(--details);
      }
    }
    
    &:hover {
      background-color: var(--dark-hover);
      transform: scale(1.005);
    }
  }
}
</style>