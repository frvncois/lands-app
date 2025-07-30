<script setup>
import AudienceIcon from '@/assets/icons/AudienceIcon.vue';
import AnalyticsIcon from '@/assets/icons/AnalyticsIcon.vue';
</script>

<template>
    <ul class="list">
        <label>Integrations</label>
        <li>
            <div class="icon">
                <AnalyticsIcon/>
            </div>
            <div class="content">
                <h3>Analtyics</h3>
                <p>Track visits and actions</p>
            </div>
            <div class="actions">
                <button>→</button>
            </div>
        </li>
        <li>
            <div class="icon">
                <AudienceIcon/>
            </div>
            <div class="content">
                <h3>Audience</h3>
                <p>Capture and send email to your fans</p>
            </div>
            <div class="actions">
                <button>→</button>
            </div>
        </li>
    </ul>
</template>


<style scoped>
ul.list {
  display: flex;
  flex-direction: column;
  gap: var(--space-rg);
  
  li {
    display: grid;
    grid-template-columns: 0.15fr 1fr 0.15fr;
    align-items: center;
    gap: var(--space-rg);
    cursor: pointer;
    padding: var(--space-rg);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border);
    transition: all var(--transition-smooth);
    background: var(--card);
    
    > .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      aspect-ratio: 1;
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
    }
    
    > .content {
      display: flex;
      flex-direction: column;
      gap: var(--space-xs);
      
      > p {
        color: var(--details);
        font-size: var(--font-sm);
        font-family: 'mono';
        text-transform: uppercase;
        transition: all var(--transition-smooth);
      }
    }
    
    > .actions {
      display: flex;
      justify-content: flex-end;
      margin-right: var(--space-md);
      
      > button {
        font-size: var(--font-rg);
        transition: all var(--transition-smooth);
      }
    }
    
    &:hover {
      background: var(--dark-hover);
      transform: scale(1.01);
      border-color: var(--focus);
      
      > .actions > button {
        transform: translateX(0.25em);
      }

      > .content > p {
        color: var(--light);
      }
    }
  }
}

.modal {
  gap: var(--space-md);
  padding: var(--space-md) 0;
  
  > .title {
    display: flex;
    justify-content: space-between;
    
    > div {
      display: flex;
      gap: var(--space-md);
      align-items: center;
      
      > h3 {
        font-size: 1em;
      }
    }
  }
}
</style>