export class DonationEngine {
  constructor() {
    this.amount = 100;
    this.slider = null;
    this.amountDisplay = null;
    this.litersDisplay = null;
    this.peopleDisplay = null;
    this.feedContainer = null;
  }

  init() {
    this.slider = document.getElementById('donation-slider');
    this.amountDisplay = document.getElementById('donation-amount');
    this.litersDisplay = document.getElementById('donation-liters');
    this.peopleDisplay = document.getElementById('donation-people');
    this.feedContainer = document.getElementById('donor-feed');

    if (this.slider) {
      this.slider.addEventListener('input', (e) => {
        this.amount = parseInt(e.target.value, 10);
        this.updateCalculations();
      });
    }

    // Donation tier cube clicks
    document.querySelectorAll('.donation-tier').forEach((tier) => {
      tier.addEventListener('click', () => {
        const amount = parseInt(tier.dataset.amount, 10);
        if (amount && this.slider) {
          this.slider.value = amount;
          this.amount = amount;
          this.updateCalculations();
        }
      });
    });

    this.updateCalculations();
    this.startDonorFeed();
  }

  updateCalculations() {
    const liters = this.amount * 60;
    const people = Math.floor(liters / 125);

    if (this.amountDisplay) {
      this.amountDisplay.textContent = '$' + this.amount.toLocaleString();
    }
    if (this.litersDisplay) {
      this.litersDisplay.textContent = liters.toLocaleString() + 'L';
    }
    if (this.peopleDisplay) {
      this.peopleDisplay.textContent = people.toLocaleString();
    }
  }

  startDonorFeed() {
    if (!this.feedContainer) return;

    const names = [
      'Sarah J.', 'Michael T.', 'Alex R.', 'Emma W.', 'David L.',
      'Yuki K.', 'Priya S.', 'Omar H.', 'Sofia M.', 'Liam O.',
      'Aisha B.', 'Carlos F.', 'Nina P.', 'Kai W.', 'Grace N.',
    ];
    const locations = [
      'New York, USA', 'London, UK', 'Sydney, AU', 'Toronto, CA', 'Berlin, DE',
      'Tokyo, JP', 'Mumbai, IN', 'Dubai, AE', 'São Paulo, BR', 'Stockholm, SE',
    ];
    const amounts = [25, 50, 60, 100, 150, 250, 500, 1000, 1500];

    // Initial delay before first entry
    setTimeout(() => {
      this._addDonorEntry(names, locations, amounts);
    }, 3000);

    setInterval(() => {
      this._addDonorEntry(names, locations, amounts);
    }, 5000);
  }

  _addDonorEntry(names, locations, amounts) {
    if (!this.feedContainer) return;

    const name = names[Math.floor(Math.random() * names.length)];
    const location = locations[Math.floor(Math.random() * locations.length)];
    const amount = amounts[Math.floor(Math.random() * amounts.length)];

    const entry = document.createElement('div');
    entry.className = 'flex items-center justify-between px-4 py-2 rounded-lg glass text-xs';
    entry.innerHTML = `
      <span class="text-white/40">${name} <span class="text-white/20">· ${location}</span></span>
      <span class="text-glacial font-display font-semibold">$${amount.toLocaleString()}</span>
    `;

    entry.style.opacity = '0';
    entry.style.transform = 'translateY(-10px)';
    entry.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';

    this.feedContainer.prepend(entry);

    requestAnimationFrame(() => {
      entry.style.opacity = '1';
      entry.style.transform = 'translateY(0)';
    });

    // Keep only the last 4 entries
    while (this.feedContainer.children.length > 4) {
      const last = this.feedContainer.lastElementChild;
      last.style.opacity = '0';
      setTimeout(() => last.remove(), 300);
    }
  }
}
