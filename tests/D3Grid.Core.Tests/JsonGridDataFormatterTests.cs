using System;
using NUnit.Framework;

namespace D3Grid.Core.Tests
{
	[TestFixture]
	public class JsonGridDataFormatterTests
	{
		[Test]
		public void when_contentType_is_applicationJson_found()
		{
			var formatter = new JsonGridDataFormatter();

			const string contentType = "application/json";

			Assert.IsTrue(formatter.RespondsTo(contentType));
		}

		[Test]
		public void when_contentType_is_applicationXml_notFound()
		{
			var formatter = new JsonGridDataFormatter();

			const string contentType = "application/xml";

			Assert.IsFalse(formatter.RespondsTo(contentType));
		}
	}
}
