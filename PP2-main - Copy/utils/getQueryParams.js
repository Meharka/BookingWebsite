
export function getQueryParams(url, allowedParams) {
    const searchParams = new URL(url).searchParams;
    const query = {};
  
    for (const param of allowedParams) {
      if (searchParams.has(param)) {
        query[param] = searchParams.get(param);
      }
    }
  
    return query;
  }