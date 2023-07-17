import axios from 'axios';

export async function youtube(id: string) {
  return axios.get(
    `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}`,
  );
}
