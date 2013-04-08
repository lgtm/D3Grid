using System;
using Xunit;

namespace D3Grid.Core.Tests
{
	public class JsonGridDataFormatterTests
	{
		[Fact]
		public void when_contentType_is_applicationJson_found()
		{
			var formatter = new JsonGridDataFormatter();

			const string contentType = "application/json";

			Assert.True(formatter.RespondsTo(contentType));
		}

		[Fact]
		public void when_contentType_is_applicationXml_notFound()
		{
			var formatter = new JsonGridDataFormatter();

			const string contentType = "application/xml";

			Assert.False(formatter.RespondsTo(contentType));
		}
	}
}
