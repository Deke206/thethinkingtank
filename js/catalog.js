const grid = document.getElementById('catalogGrid');
const filter = document.getElementById('categoryFilter');
let products = [];

function render(items) {
  grid.innerHTML = '';
  items.forEach((item) => {
    const uses = item.uses.map((use) => `<span class="badge badge-soft me-1 mb-1">${use}</span>`).join('');
    grid.insertAdjacentHTML('beforeend', `
      <div class="col-md-6 col-lg-4">
        <article class="card h-100">
          <div class="card-body">
            <p class="text-uppercase small fw-bold text-secondary mb-2">${item.category}</p>
            <h3 class="h5">${item.name}</h3>
            <p>${item.details}</p>
            <p class="product-meta mb-2"><strong>System:</strong> ${item.voltage}</p>
            <div>${uses}</div>
          </div>
        </article>
      </div>`);
  });
}

fetch('data/products.json')
  .then((response) => {
    if (!response.ok) throw new Error('Catalog could not be loaded.');
    return response.json();
  })
  .then((data) => {
    products = data;
    const categories = [...new Set(products.map((product) => product.category))].sort();
    categories.forEach((category) => filter.insertAdjacentHTML('beforeend', `<option value="${category}">${category}</option>`));
    render(products);
  })
  .catch((error) => {
    grid.innerHTML = `<p class="text-danger">${error.message}</p>`;
  });

filter.addEventListener('change', () => {
  const selected = filter.value;
  render(selected === 'all' ? products : products.filter((product) => product.category === selected));
});
