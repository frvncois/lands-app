import type { CategoryOption } from './types'

export const PROJECT_CATEGORIES: CategoryOption[] = [
  {
    id: 'music-creative',
    label: 'Music & Creative',
    icon: 'lni-music',
    subcategories: [
      {
        id: 'band',
        label: 'Band / Music Group',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'media-text', variant: 'image-left' },
          { type: 'events' },
          { type: 'gallery' },
          { type: 'subscribe' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'New album out now',
          ctaLabel: 'Listen Now'
        }
      },
      {
        id: 'musician',
        label: 'Solo Musician / Artist',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'text' },
          { type: 'gallery' },
          { type: 'events' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Singer • Songwriter • Producer',
          ctaLabel: 'Book Me'
        }
      },
      {
        id: 'dj',
        label: 'DJ / Producer',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'media-text', variant: 'image-right' },
          { type: 'events' },
          { type: 'links' },
          { type: 'subscribe' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: 'DJ {name}',
          subheadline: 'Electrifying sets for any occasion',
          ctaLabel: 'Book Now'
        }
      },
      {
        id: 'album-release',
        label: 'Album / Single Release',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'text' },
          { type: 'links' },
          { type: 'gallery' },
          { type: 'subscribe' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Out now on all platforms',
          ctaLabel: 'Stream Now'
        }
      },
      {
        id: 'tour',
        label: 'Tour / Concert Series',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'events' },
          { type: 'gallery' },
          { type: 'subscribe' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'World Tour 2025',
          ctaLabel: 'Get Tickets'
        }
      },
      {
        id: 'photographer',
        label: 'Photographer',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'minimal' },
          { type: 'gallery' },
          { type: 'text' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Capturing moments that matter',
          ctaLabel: 'View Portfolio'
        }
      },
      {
        id: 'videographer',
        label: 'Videographer / Filmmaker',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'gallery' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Cinematic storytelling for brands and events',
          ctaLabel: 'See My Work'
        }
      },
      {
        id: 'artist-portfolio',
        label: 'Artist Portfolio',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'minimal' },
          { type: 'gallery' },
          { type: 'text' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Visual Artist & Illustrator',
          ctaLabel: 'Explore'
        }
      },
      {
        id: 'design-studio',
        label: 'Design Studio',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'cards' },
          { type: 'gallery' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Creative design solutions for modern brands',
          ctaLabel: 'View Projects'
        }
      },
      {
        id: 'creative-agency',
        label: 'Creative Agency',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'media-text', variant: 'image-left' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Turning ideas into unforgettable experiences',
          ctaLabel: 'Start a Project'
        }
      },
      {
        id: 'podcast',
        label: 'Podcast',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'subscribe' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'New episodes every week',
          ctaLabel: 'Listen Now'
        }
      },
      {
        id: 'voice-actor',
        label: 'Voice Actor / Voice Over',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Professional voice for commercials, games & more',
          ctaLabel: 'Hire Me'
        }
      }
    ]
  },
  {
    id: 'food-hospitality',
    label: 'Food & Hospitality',
    icon: 'lni-restaurant',
    subcategories: [
      {
        id: 'restaurant',
        label: 'Restaurant',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'menu' },
          { type: 'gallery' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Authentic Italian cuisine in the heart of the city',
          ctaLabel: 'Reserve a Table'
        }
      },
      {
        id: 'cafe',
        label: 'Café / Coffee Shop',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'text' },
          { type: 'menu' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Artisan coffee and fresh pastries daily',
          ctaLabel: 'Visit Us'
        }
      },
      {
        id: 'bar',
        label: 'Bar / Pub',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'menu' },
          { type: 'events' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Craft cocktails and good vibes',
          ctaLabel: 'See Menu'
        }
      },
      {
        id: 'food-truck',
        label: 'Food Truck',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'menu' },
          { type: 'text' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Street food with gourmet flavors',
          ctaLabel: 'Find Us Today'
        }
      },
      {
        id: 'catering',
        label: 'Catering Service',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'gallery' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Exceptional catering for weddings, events & corporate gatherings',
          ctaLabel: 'Request Quote'
        }
      },
      {
        id: 'bakery',
        label: 'Bakery / Pastry Shop',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'gallery' },
          { type: 'menu' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Freshly baked goods made with love',
          ctaLabel: 'Order Now'
        }
      },
      {
        id: 'hotel',
        label: 'Hotel / Bed & Breakfast',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'gallery' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Your home away from home',
          ctaLabel: 'Book Your Stay'
        }
      },
      {
        id: 'winery',
        label: 'Winery / Brewery',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'text' },
          { type: 'gallery' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Crafted with tradition and passion',
          ctaLabel: 'Visit & Taste'
        }
      },
      {
        id: 'private-chef',
        label: 'Private Chef',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'text' },
          { type: 'gallery' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: 'Chef {name}',
          subheadline: 'Personalized dining experiences in your home',
          ctaLabel: 'Book a Menu Consultation'
        }
      },
      {
        id: 'meal-prep',
        label: 'Meal Prep / Delivery Service',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'cards' },
          { type: 'text' },
          { type: 'cta' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Healthy meals delivered to your door',
          ctaLabel: 'Order Now'
        }
      }
    ]
  },
  {
    id: 'services',
    label: 'Services',
    icon: 'lni-briefcase',
    subcategories: [
      {
        id: 'consultant',
        label: 'Consultant / Advisor',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'text' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Strategic guidance for sustainable growth',
          ctaLabel: 'Schedule Consultation'
        }
      },
      {
        id: 'coach',
        label: 'Coach / Mentor',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Empowering you to reach your full potential',
          ctaLabel: 'Start Coaching'
        }
      },
      {
        id: 'therapist',
        label: 'Therapist / Counselor',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'minimal' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Compassionate care for mental wellness',
          ctaLabel: 'Book Appointment'
        }
      },
      {
        id: 'personal-trainer',
        label: 'Personal Trainer',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'gallery' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Transform your body and mind',
          ctaLabel: 'Get Started'
        }
      },
      {
        id: 'yoga-instructor',
        label: 'Yoga / Wellness Instructor',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'text' },
          { type: 'events' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Find balance through mindful movement',
          ctaLabel: 'Join a Class'
        }
      },
      {
        id: 'hair-salon',
        label: 'Hair Salon / Barbershop',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'gallery' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Expert cuts and styling for every look',
          ctaLabel: 'Book Appointment'
        }
      },
      {
        id: 'spa',
        label: 'Spa / Massage Therapy',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'cards' },
          { type: 'text' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Relax, rejuvenate, restore',
          ctaLabel: 'Book Session'
        }
      },
      {
        id: 'mechanic',
        label: 'Auto Mechanic / Garage',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'text' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Trusted auto repair and maintenance',
          ctaLabel: 'Schedule Service'
        }
      },
      {
        id: 'cleaning',
        label: 'Cleaning Service',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'cards' },
          { type: 'text' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Professional cleaning for homes and offices',
          ctaLabel: 'Get a Quote'
        }
      },
      {
        id: 'landscaping',
        label: 'Landscaping / Gardening',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'gallery' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Beautiful outdoor spaces designed for you',
          ctaLabel: 'Request Consultation'
        }
      },
      {
        id: 'realtor',
        label: 'Real Estate Agent',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Helping you find the perfect home',
          ctaLabel: 'Contact Me'
        }
      }
    ]
  },
  {
    id: 'commerce-selling',
    label: 'Commerce & Selling',
    icon: 'lni-cart',
    subcategories: [
      {
        id: 'online-store',
        label: 'Online Store',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'cards' },
          { type: 'text' },
          { type: 'subscribe' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Shop our latest collection',
          ctaLabel: 'Shop Now'
        }
      },
      {
        id: 'product-launch',
        label: 'Product Launch',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'media-text', variant: 'image-left' },
          { type: 'cards' },
          { type: 'cta' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: 'Introducing {name}',
          subheadline: 'The future is here',
          ctaLabel: 'Pre-Order Now'
        }
      },
      {
        id: 'subscription-box',
        label: 'Subscription Box',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'cards' },
          { type: 'text' },
          { type: 'subscribe' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Curated surprises delivered monthly',
          ctaLabel: 'Subscribe'
        }
      },
      {
        id: 'handmade-shop',
        label: 'Handmade / Artisan Shop',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'minimal' },
          { type: 'gallery' },
          { type: 'text' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Handcrafted with care and creativity',
          ctaLabel: 'Browse Collection'
        }
      },
      {
        id: 'dropshipping',
        label: 'Dropshipping Store',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'cards' },
          { type: 'text' },
          { type: 'cta' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Quality products, fast shipping',
          ctaLabel: 'Shop Now'
        }
      },
      {
        id: 'digital-products',
        label: 'Digital Products',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'text' },
          { type: 'cta' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Instant downloads for creators and professionals',
          ctaLabel: 'Get Access'
        }
      },
      {
        id: 'merch-store',
        label: 'Merch / Brand Store',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'cards' },
          { type: 'gallery' },
          { type: 'subscribe' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name} Merch',
          subheadline: 'Wear the brand you love',
          ctaLabel: 'Shop Merch'
        }
      }
    ]
  },
  {
    id: 'events-experiences',
    label: 'Events & Experiences',
    icon: 'lni-calendar',
    subcategories: [
      {
        id: 'wedding',
        label: 'Wedding',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'text' },
          { type: 'events' },
          { type: 'gallery' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Join us as we celebrate our love',
          ctaLabel: 'RSVP'
        }
      },
      {
        id: 'conference',
        label: 'Conference / Summit',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'events' },
          { type: 'subscribe' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Leading voices in tech, business & innovation',
          ctaLabel: 'Register Now'
        }
      },
      {
        id: 'workshop',
        label: 'Workshop / Training',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'events' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Learn from the experts',
          ctaLabel: 'Sign Up'
        }
      },
      {
        id: 'webinar',
        label: 'Webinar',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'text' },
          { type: 'cta' },
          { type: 'subscribe' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Free online event',
          ctaLabel: 'Reserve Your Spot'
        }
      },
      {
        id: 'festival',
        label: 'Festival / Fair',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'events' },
          { type: 'gallery' },
          { type: 'subscribe' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'A weekend of music, food, and fun',
          ctaLabel: 'Get Tickets'
        }
      },
      {
        id: 'fundraiser',
        label: 'Fundraiser / Charity Event',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'cta' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Help us make a difference',
          ctaLabel: 'Donate Now'
        }
      },
      {
        id: 'retreat',
        label: 'Retreat / Getaway',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'text' },
          { type: 'gallery' },
          { type: 'events' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Escape, reflect, recharge',
          ctaLabel: 'Join Us'
        }
      },
      {
        id: 'meetup',
        label: 'Meetup / Networking Event',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'text' },
          { type: 'events' },
          { type: 'subscribe' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Connect with like-minded people',
          ctaLabel: 'RSVP'
        }
      },
      {
        id: 'class-series',
        label: 'Class / Course Series',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'events' },
          { type: 'cta' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Master new skills in 6 weeks',
          ctaLabel: 'Enroll Now'
        }
      },
      {
        id: 'exhibition',
        label: 'Exhibition / Art Show',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'minimal' },
          { type: 'text' },
          { type: 'gallery' },
          { type: 'events' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Exploring contemporary art',
          ctaLabel: 'Visit'
        }
      }
    ]
  },
  {
    id: 'personal-professional',
    label: 'Personal & Professional',
    icon: 'lni-user',
    subcategories: [
      {
        id: 'portfolio',
        label: 'Personal Portfolio',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'minimal' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'gallery' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Developer • Designer • Creator',
          ctaLabel: 'View Work'
        }
      },
      {
        id: 'resume',
        label: 'Resume / CV',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'minimal' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Full-Stack Developer',
          ctaLabel: 'Download Resume'
        }
      },
      {
        id: 'personal-brand',
        label: 'Personal Brand / Influencer',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'text' },
          { type: 'links' },
          { type: 'subscribe' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Lifestyle • Travel • Inspiration',
          ctaLabel: 'Follow'
        }
      },
      {
        id: 'author',
        label: 'Author / Writer',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'subscribe' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Award-winning author of fiction and non-fiction',
          ctaLabel: 'Read More'
        }
      },
      {
        id: 'speaker',
        label: 'Speaker / Keynote',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'events' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Inspiring audiences worldwide',
          ctaLabel: 'Book Me'
        }
      },
      {
        id: 'wedding-planner',
        label: 'Wedding Planner',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'gallery' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Creating unforgettable wedding experiences',
          ctaLabel: 'Start Planning'
        }
      },
      {
        id: 'interior-designer',
        label: 'Interior Designer',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'minimal' },
          { type: 'gallery' },
          { type: 'text' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Transforming spaces into stunning sanctuaries',
          ctaLabel: 'See Projects'
        }
      },
      {
        id: 'stylist',
        label: 'Stylist / Fashion Consultant',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'text' },
          { type: 'gallery' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Personal styling for every occasion',
          ctaLabel: 'Book Consultation'
        }
      },
      {
        id: 'tutor',
        label: 'Tutor / Educator',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Expert tutoring for students of all ages',
          ctaLabel: 'Start Learning'
        }
      }
    ]
  },
  {
    id: 'business-startups',
    label: 'Business & Startups',
    icon: 'lni-rocket',
    subcategories: [
      {
        id: 'saas',
        label: 'SaaS Product',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'media-text', variant: 'image-left' },
          { type: 'cta' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'The all-in-one solution for modern teams',
          ctaLabel: 'Start Free Trial'
        }
      },
      {
        id: 'mobile-app',
        label: 'Mobile App',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'cards' },
          { type: 'media-text', variant: 'image-right' },
          { type: 'cta' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Simplify your life with our app',
          ctaLabel: 'Download Now'
        }
      },
      {
        id: 'startup',
        label: 'Startup / New Venture',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'subscribe' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Revolutionizing the way we work',
          ctaLabel: 'Join Waitlist'
        }
      },
      {
        id: 'consulting-firm',
        label: 'Consulting Firm',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'text' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Strategic solutions for complex challenges',
          ctaLabel: 'Work With Us'
        }
      },
      {
        id: 'marketing-agency',
        label: 'Marketing Agency',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'cards' },
          { type: 'media-text', variant: 'image-left' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Grow your brand with data-driven marketing',
          ctaLabel: 'Get Started'
        }
      },
      {
        id: 'financial-services',
        label: 'Financial Services',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'text' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Expert financial planning for your future',
          ctaLabel: 'Schedule Meeting'
        }
      },
      {
        id: 'law-firm',
        label: 'Law Firm / Legal Services',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'text' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Trusted legal representation',
          ctaLabel: 'Consult Now'
        }
      },
      {
        id: 'recruitment',
        label: 'Recruitment / Staffing Agency',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'cards' },
          { type: 'text' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Connecting talent with opportunity',
          ctaLabel: 'Find Jobs'
        }
      }
    ]
  },
  {
    id: 'local-irl',
    label: 'Local & IRL Businesses',
    icon: 'lni-map-marker',
    subcategories: [
      {
        id: 'retail-shop',
        label: 'Retail Shop / Boutique',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'gallery' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Unique finds for unique people',
          ctaLabel: 'Visit Us'
        }
      },
      {
        id: 'gym',
        label: 'Gym / Fitness Studio',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'cards' },
          { type: 'events' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Your fitness journey starts here',
          ctaLabel: 'Join Now'
        }
      },
      {
        id: 'dance-studio',
        label: 'Dance Studio',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'events' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Dance classes for all ages and levels',
          ctaLabel: 'Join a Class'
        }
      },
      {
        id: 'music-school',
        label: 'Music School / Lessons',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Learn to play from expert instructors',
          ctaLabel: 'Enroll Today'
        }
      },
      {
        id: 'pet-services',
        label: 'Pet Services / Grooming',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'gallery' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Loving care for your furry friends',
          ctaLabel: 'Book Appointment'
        }
      },
      {
        id: 'daycare',
        label: 'Daycare / Preschool',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'A safe and nurturing environment for kids',
          ctaLabel: 'Schedule Tour'
        }
      },
      {
        id: 'vet-clinic',
        label: 'Veterinary Clinic',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'text' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Compassionate care for pets',
          ctaLabel: 'Book Appointment'
        }
      },
      {
        id: 'dental',
        label: 'Dental Practice',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'cards' },
          { type: 'text' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Healthy smiles for the whole family',
          ctaLabel: 'Schedule Appointment'
        }
      },
      {
        id: 'medical-practice',
        label: 'Medical Practice / Clinic',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'text' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Quality healthcare you can trust',
          ctaLabel: 'Book Appointment'
        }
      },
      {
        id: 'community-center',
        label: 'Community Center / Rec Center',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'events' },
          { type: 'cards' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Where community comes together',
          ctaLabel: 'Explore Programs'
        }
      }
    ]
  },
  {
    id: 'community-nonprofit',
    label: 'Community & Non-Profit',
    icon: 'lni-heart',
    subcategories: [
      {
        id: 'nonprofit',
        label: 'Non-Profit Organization',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'cta' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Making a positive impact in our community',
          ctaLabel: 'Support Us'
        }
      },
      {
        id: 'church',
        label: 'Church / Religious Organization',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'text' },
          { type: 'events' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'All are welcome',
          ctaLabel: 'Visit Us'
        }
      },
      {
        id: 'school',
        label: 'School / Educational Institution',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'cards' },
          { type: 'events' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Inspiring the next generation',
          ctaLabel: 'Learn More'
        }
      },
      {
        id: 'sports-team',
        label: 'Sports Team / Club',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'events' },
          { type: 'gallery' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Play with passion, win with pride',
          ctaLabel: 'Join the Team'
        }
      },
      {
        id: 'advocacy',
        label: 'Advocacy / Awareness Campaign',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'split' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'cta' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Join the movement for change',
          ctaLabel: 'Take Action'
        }
      },
      {
        id: 'volunteer',
        label: 'Volunteer Program',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'centered' },
          { type: 'text' },
          { type: 'cards' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Give back, make a difference',
          ctaLabel: 'Volunteer Today'
        }
      },
      {
        id: 'neighborhood',
        label: 'Neighborhood / HOA',
        sections: [
          { type: 'header' },
          { type: 'hero', variant: 'minimal' },
          { type: 'text' },
          { type: 'events' },
          { type: 'contact' },
          { type: 'footer' }
        ],
        placeholders: {
          headline: '{name}',
          subheadline: 'Building a stronger community together',
          ctaLabel: 'Get Involved'
        }
      }
    ]
  }
]
