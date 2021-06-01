export async function fetchJson(url: string): Promise<any> {
  return fetch(url).then((response) => {
    if (response.status === 204) {
      return {};
    }
    return response.json();
  });
}
