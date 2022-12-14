using System.Text.Json;
using System.Text.Json.Serialization;
using Azure;
using Azure.Data.Tables;

namespace GiftsApi.Models;

public class Card
{
    public Guid Id { get; set; }
    public Guid GroupId { get; set; }
    public Guid WishlistId { get; set; }
    public string Content { get; set; }
    public Dictionary<string, bool> Tags { get; set; }
    public bool VisibleToListOwners { get; set; }

    [JsonIgnore]
    private ETag _eTag { get; set; }

    [JsonIgnore]
    public CardEntity Entity
    {
        get => new CardEntity
        {
            PartitionKey = $"Group:{GroupId}:Wishlist:{WishlistId}:Card",
            RowKey = Id.ToString(),
            Content = Content,
            VisibleToListOwners = VisibleToListOwners,
            Tags = JsonSerializer.Serialize(Tags),
            ETag = _eTag,
        };
        set => (Id, GroupId, WishlistId, Content, VisibleToListOwners, Tags, _eTag) = (
            Guid.Parse(value.RowKey),
            Guid.Parse(value.PartitionKey.Split(":")[1]),
            Guid.Parse(value.PartitionKey.Split(":")[3]),
            value.Content,
            value.VisibleToListOwners,
            JsonSerializer.Deserialize<Dictionary<string,bool>>(value.Tags ?? "{}") ?? new (),
            value.ETag
        );
    }
}

public class CardEntity : ITableEntity
{
    public string PartitionKey { get; set; }
    public string RowKey { get; set; }

    public string Content { get; set; }
    public string Tags { get; set; }
    public bool VisibleToListOwners { get; set; }
    public DateTimeOffset? Timestamp { get; set; }
    public ETag ETag { get; set; }
}