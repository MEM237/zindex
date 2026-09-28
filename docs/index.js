const GROUP = "mark-ezra-designs";
const PUBLITAS_API = `https://api.publitas.com/v1/groups/${GROUP}/publications.json`;

const FALLBACK = "publitas-inventory.json";

async function getLivePublications() {
  const response = await fetch(PUBLITAS_API, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Publitas returned ${response.status}`);
  }

  const publications = await response.json();

  return Promise.all(
    publications.map(async (publication) => {
      const detailResponse = await fetch(
        `https://api.publitas.com/v1/groups/${GROUP}/publications/${publication.slug}`,
        { cache: "no-store" },
      );

      if (!detailResponse.ok) {
        throw new Error(`Publitas detail returned ${detailResponse.status}`);
      }

      const detail = await detailResponse.json();
      const spreads = detail.spreads || [];
      const pages = spreads[0]?.pages || [];

      if (!pages.length) return null;

      return {
        id: String(publication.id),
        title: publication.title,
        status: "public",
        url: `https://view.publitas.com/${GROUP}/${publication.slug}/`,
        cover: `https://view.publitas.com${pages[0]}-at200.jpg`,
      };
    }),
  );
}

async function getFallbackPublications() {
  const response = await fetch(FALLBACK);

  if (!response.ok) {
    throw new Error(`Fallback inventory returned ${response.status}`);
  }

  return response.json();
}

function renderPublications(publications) {
  const index = document.getElementById("index");
  index.replaceChildren();

  publications
    .filter(
      (publication) =>
        publication &&
        publication.status === "public" &&
        publication.url &&
        publication.cover,
    )
    .forEach((publication) => {
      const link = document.createElement("a");
      link.className = "publication";
      link.href = publication.url;
      link.target = "_blank";
      link.rel = "noopener";

      const img = document.createElement("img");
      img.src = publication.cover;
      img.alt = publication.title || "";
      img.loading = "lazy";

      const title = document.createElement("span");
      title.className = "title";

      const slug = new URL(publication.url).pathname
        .split("/")
        .filter(Boolean)
        .pop();

      title.textContent = slug.replace(/[-_]+/g, " ").toUpperCase();

      link.append(img, title);
      index.append(link);
    });
}

async function syncPublitas() {
  try {
    const publications = await getLivePublications();
    renderPublications(publications);
    console.log(`Z/INDEX: live Publitas catalog (${publications.length})`);
  } catch (error) {
    console.warn("Z/INDEX: live Publitas check failed; using fallback.", error);

    try {
      const publications = await getFallbackPublications();
      renderPublications(publications);
    } catch (fallbackError) {
      console.error("Z/INDEX inventory error:", fallbackError);
    }
  }
}

const syncButton = document.getElementById("sync-button");

if (syncButton) {
  syncButton.addEventListener("click", syncPublitas);
}

syncPublitas();
