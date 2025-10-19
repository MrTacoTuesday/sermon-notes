namespace SermonNotesApp
{
	public class BibleService
	{
		private readonly HttpClient _http;
		private const string ApiKey = "YOUR_API_KEY_HERE";
		private const string BaseUrl = "https://api.scripture.api.bible/v1/bibles/";

		public BibleService(HttpClient http)
		{
			_http = http;
			_http.DefaultRequestHeaders.Add("api-key", ApiKey);
		}

		public async Task<string> GetVerseTextAsync(string bibleId, string reference)
		{
			var response = await _http.GetAsync($"{BaseUrl}{bibleId}/passages/{reference}");
			response.EnsureSuccessStatusCode();

			var json = await response.Content.ReadFromJsonAsync<JsonElement>();
			return json.GetProperty("data").GetProperty("content").GetString();
		}
	}
}
