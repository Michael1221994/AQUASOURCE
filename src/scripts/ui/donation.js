export class DonationEngine {
  constructor() {
    this.amount = 100;
    this.slider = null;
    this.amountDisplay = null;
    this.litersDisplay = null;
    this.peopleDisplay = null;
    this.feedContainer = null;
    this.tiers = [];
  }

  init() {
    this.slider = document.getElementById('donation-slider');
    this.amountDisplay = document.getElementById('donation-amount');
    this.litersDisplay = document.getElementById('donation-liters');
    this.peopleDisplay = document.getElementById('donation-people');
    this.feedContainer = document.getElementById('donor-feed');
    this.tiers = Array.from(document.querySelectorAll('.donation-tier'));

    if (this.slider) {
      this.slider.addEventListener('input', (e) => {
        this.amount = parseInt(e.target.value, 10) || 100;
        this.updateCalculations();
        this._updateSelectedTier();
      });
    }

    // Donation tier cube clicks
    this.tiers.forEach((tier) => {
      tier.addEventListener('click', () => {
        const amount = parseInt(tier.dataset.amount, 10);
        if (amount) {
          this.amount = amount;
          if (this.slider) {
            this.slider.value = amount;
          }
          this.updateCalculations();
          this._updateSelectedTier();
        }
      });
    });

    this.updateCalculations();
    this._updateSelectedTier();
    this.startDonorFeed();
  }

  _updateSelectedTier() {
    this.tiers.forEach((t) => {
      const amt = parseInt(t.dataset.amount, 10);
      if (amt === this.amount) {
        t.classList.add('is-selected');
      } else {
        t.classList.remove('is-selected');
      }
    });
  }

  updateCalculations() {
    const liters = this.amount * 60;
    const people = Math.max(1, Math.floor(liters / 125));

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

    const initialDonors = [
      { name: 'Sarah J.', loc: 'Toronto, CA', amt: 150 },
      { name: 'Marcus K.', loc: 'Berlin, DE', amt: 25 },
      { name: 'Carlos F.', loc: 'Stockholm, SE', amt: 60 },
    ];

    this.feedContainer.innerHTML = '';
    initialDonors.forEach((d) => {
      const entry = this._createDonorElement(d.name, d.loc, d.amt);
      this.feedContainer.appendChild(entry);
    });

    const pool = [
      { name: 'Alex R.', loc: 'London, UK', amt: 250 },
      { name: 'Emma W.', loc: 'Sydney, AU', amt: 100 },
      { name: 'David L.', loc: 'New York, USA', amt: 50 },
      { name: 'Yuki K.', loc: 'Tokyo, JP', amt: 500 },
      { name: 'Priya S.', loc: 'Mumbai, IN', amt: 25 },
      { name: 'Omar H.', loc: 'Dubai, AE', amt: 1500 },
      { name: 'Sofia M.', loc: 'São Paulo, BR', amt: 60 },
    ];

    setInterval(() => {
      const randomDonor = pool[Math.floor(Math.random() * pool.length)];
      const entry = this._createDonorElement(randomDonor.name, randomDonor.loc, randomDonor.amt);
      entry.style.opacity = '0';
      entry.style.transform = 'translateY(-6px)';
      entry.style.transition = 'all 0.4s ease';

      this.feedContainer.prepend(entry);

      requestAnimationFrame(() => {
        entry.style.opacity = '1';
        entry.style.transform = 'translateY(0)';
      });

      // Keep fixed 3 entries max to prevent vertical layout shifts
      if (this.feedContainer.children.length > 3) {
        const last = this.feedContainer.lastElementChild;
        if (last) last.remove();
      }
    }, 4500);
  }

  _createDonorElement(name, location, amount) {
    const entry = document.createElement('div');
    entry.className = 'flex items-center justify-between px-4 py-2.5 rounded-lg glass text-xs w-full';
    entry.innerHTML = `
      <span class="text-white/60 font-body">${name} <span class="text-white/30 font-mono text-[10px]">· ${location}</span></span>
      <span class="text-glacial font-mono font-semibold">$${amount.toLocaleString()}</span>
    `;
    return entry;
  }
}
