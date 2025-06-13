import { GoGoAnime } from 'gogoanime-api';

import { getAnimeTitle } from './api';

const gogo = new GoGoAnime();

export async function getAnimeSlug(title: string, episode: number) {
  const emptyData = {
    sub: {
      Referer: '',
      sources: [],
    },
    dub: {
      Referer: '',
      sources: [],
    },
    episodes: 0,
  };

  if (!title || title === '') return emptyData;

  const slug = title.replace(/[^0-9a-zA-Z]+/g, ' ');

  const searchResults = await gogo.search(slug);

  if (searchResults.data.length === 0) return emptyData;

  const animeInfo = await gogo.animeInfo(searchResults.data[0].id);

  const episodeSlug = animeInfo.movieId;

  // fetch animes dub and sub
  const subAnime = gogo.animeEpisodeVideo(`${episodeSlug}-episode-${episode}`);
  const dubAnime = gogo.animeEpisodeVideo(
    `${episodeSlug.replace(/-movie$/, '')}-dub-episode-${episode}`
  );

  const [sub, dub] = await Promise.all([subAnime, dubAnime]).catch(() => [
    { source: [], source_bk: [] },
    { source: [], source_bk: [] },
  ]);

  return {
    sub: {
      Referer: '',
      sources: [...(sub.source || []), ...(sub.source_bk || [])],
    },
    dub: {
      Referer: '',
      sources: [...(dub.source || []), ...(dub.source_bk || [])],
    },
    episodes: animeInfo.episodeCount || 0,
  };
}

export async function getAnime(id: number, episode: number) {
  let { english, romaji } = (await getAnimeTitle({ id })).Media.title;

  // ensure both of them don't have null value
  english = english || romaji;
  romaji = romaji || english;

  // lower case both the titles
  english = english.toLocaleLowerCase();
  romaji = romaji.toLocaleLowerCase();

  // if the titles are same run this function once
  if (english === romaji) {
    return getAnimeSlug(english, episode);
  }

  // get both romaji and english results
  const romajiAnime = getAnimeSlug(romaji, episode);
  const englishAnime = getAnimeSlug(english, episode);

  // grab the one which has episodes key
  const anime = await Promise.all([englishAnime, romajiAnime]).then((r) =>
    r[0].episodes > 0 ? r[0] : r[1]
  );

  return anime;
}
