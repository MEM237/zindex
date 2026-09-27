fetch('publitas-inventory.json')
  .then(response => response.json())
  .then(publications => {
    const index = document.getElementById('index');

    publications.filter(publication => publication.status === 'public').forEach(publication => {
      if (!publication.url || !publication.cover) return;

      const link = document.createElement('a');
      link.className = 'publication';
      link.href = publication.url;
      link.target = '_blank';
      link.rel = 'noopener';

      const img = document.createElement('img');
      img.src = publication.cover;
      img.alt = publication.title || '';
      img.loading = 'lazy';

      const title = document.createElement('span');
      title.className = 'title';

      const slug = new URL(publication.url)
        .pathname
        .split('/')
        .filter(Boolean)
        .pop();

      title.textContent = slug
        .replace(/[-_]+/g, ' ')
        .toUpperCase();

      link.append(img, title);
      index.append(link);
    });
  })
  .catch(error => {
    console.error('Z/INDEX inventory error:', error);
  });
