export const clientTour = {
  tour: 'client-dashboard',
  steps: [
    {
      icon: '👋',
      title: 'Welcome to NDT Exchange!',
      content: "Let's take a quick tour of your client dashboard.",
      selector: '#dashboard-main-content',
    },
    {
      icon: '🏠',
      title: 'Your Dashboard',
      content: 'This is your main dashboard, giving you an at-a-glance overview of your assets and jobs.',
      selector: '#sidebar-menu-item-dashboard',
    },
    {
      icon: '🏢',
      title: 'Asset Register',
      content: "Manage all your company's physical assets here. You can add new assets, track their status, and view their inspection history.",
      selector: '#sidebar-menu-item-assets',
    },
    {
      icon: '➕',
      title: 'Post a New Job',
      content: 'When you need an inspection, start here. Post a job to our marketplace to receive competitive bids from qualified providers.',
      selector: '#sidebar-menu-item-post-job',
    },
    {
      icon: '👤',
      title: 'Your Account',
      content: 'Manage your personal and company settings, view notifications, and access support from your profile menu.',
      selector: '#user-profile-button',
    },
  ],
};

export const inspectorTour = {
    tour: 'inspector-dashboard',
    steps: [
      {
        icon: '👋',
        title: 'Welcome to NDT Exchange!',
        content: "Let's take a quick tour of your provider dashboard.",
        selector: '#dashboard-main-content', 
      },
      {
        icon: '🔍',
        title: 'Find Jobs',
        content: 'This is the marketplace where you can find new inspection jobs posted by clients.',
        selector: '#sidebar-menu-item-find-jobs',
      },
      {
        icon: '📜',
        title: 'My Bids',
        content: "Track the status of all the bids you've submitted for jobs here.",
        selector: '#sidebar-menu-item-my-bids',
      },
      {
        icon: '🔧',
        title: 'Your Equipment',
        content: 'Manage your inventory of NDT equipment. Keep track of calibration dates and usage history.',
        selector: '#sidebar-menu-item-equipment',
      },
      {
        icon: '👤',
        title: 'Your Account',
        content: 'Manage your personal and company settings, view notifications, and access support from your profile menu.',
        selector: '#user-profile-button',
      },
    ],
  };

export const allTours = [clientTour, inspectorTour];
