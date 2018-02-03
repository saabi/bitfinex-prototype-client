export async function getJSON<T>(path: string): Promise<T> {
    let r = await fetch(path);
    let json = await r.json();
    if (json.error || r.status !== 200)
        throw json;
    return json as T;
}
