'use strict';

const tpl = document.createElement('template');
tpl.innerHTML = `
  <div class="card">
    <p style="font-size:.95rem;line-height:1.6;color:#374151;">
      Please have your <strong>government-issued ID</strong> ready.
      You will be asked to take a live photo &mdash; uploads are not accepted.
    </p>
  </div>
  <button class="btn btn-primary">Start Verification</button>
`;

class HomeScreen extends HTMLElement {
  connectedCallback() {
    this.appendChild(tpl.content.cloneNode(true));
    this.querySelector('button').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('start', { bubbles: true }));
    });
  }
}

customElements.define('home-screen', HomeScreen);
