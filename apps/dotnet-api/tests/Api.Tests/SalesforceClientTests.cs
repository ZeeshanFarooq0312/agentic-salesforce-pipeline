using System.Net;
using System.Text;
using Api;
using Xunit;

public class SalesforceClientTests
{
    private sealed class StubHandler(HttpStatusCode status, string body) : HttpMessageHandler
    {
        public HttpRequestMessage? Seen { get; private set; }
        public string? SeenBody { get; private set; }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken ct)
        {
            Seen = request;
            SeenBody = request.Content is null ? null : await request.Content.ReadAsStringAsync(ct);
            return new HttpResponseMessage(status) { Content = new StringContent(body, Encoding.UTF8, "application/json") };
        }
    }

    private static SalesforceClient Client(StubHandler handler) =>
        new(new HttpClient(handler) { BaseAddress = new Uri("https://example.my.salesforce.com/") });

    [Fact]
    public async Task Creates_account_and_returns_id()
    {
        var handler = new StubHandler(HttpStatusCode.Created, "{\"id\":\"001XX0000001\",\"success\":true}");
        var result = await Client(handler).CreateAccountAsync(new CreateAccountRequest("Acme", 20_000_000));

        Assert.Equal("001XX0000001", result.Id);
        Assert.Equal(HttpMethod.Post, handler.Seen!.Method);
        Assert.EndsWith("/services/data/v62.0/sobjects/Account", handler.Seen.RequestUri!.AbsolutePath);
        Assert.Contains("\"Name\":\"Acme\"", handler.SeenBody);
        Assert.Contains("\"AnnualRevenue\":20000000", handler.SeenBody);
    }

    [Fact]
    public async Task Salesforce_error_becomes_SalesforceException()
    {
        var handler = new StubHandler(HttpStatusCode.BadRequest, "[{\"errorCode\":\"REQUIRED_FIELD_MISSING\"}]");
        var ex = await Assert.ThrowsAsync<SalesforceException>(() =>
            Client(handler).CreateAccountAsync(new CreateAccountRequest("Acme", 1)));
        Assert.Contains("400", ex.Message);
    }
}
