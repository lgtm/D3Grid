
namespace D3Grid
{
	public static class StringExtensions
	{
		public static string HtmlEncode(this string target)
		{
			return System.Net.WebUtility.HtmlEncode(target);
		}
	}
}
