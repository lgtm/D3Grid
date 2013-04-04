using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;

namespace D3Grid.Core
{
	public class JsonGridDataFormatter : IGridDataFormatter
	{
		private static readonly string[] SupportedResponseTypes = new[]
		{
			"application/json"
		};

		public bool RespondsTo(string format)
		{
			return SupportedResponseTypes.Contains(format.ToLower());
		}

		public string GetData<TRow>(IEnumerable<TRow> currentPage, int totalRowCount, string footerText = null) where TRow : class
		{
			var gridColumns = GetGridColumns<TRow>();

			var gridColumnsJson = GetColumnsJson(gridColumns);
			var gridRowsJson = GetRowsJson(currentPage, gridColumns);

			return string.Format(@"{{
				""rows"":{0},
				""columns"":{1},
				""totalRowCount"":{2},
				""footerText"":""{3}""
			}}", gridRowsJson, gridColumnsJson, totalRowCount, footerText.HtmlEncode());
		}

		private static IEnumerable<GridColumn> GetGridColumns<TRow>()
			where TRow : class
		{
			return typeof(TRow).GetProperties()
							   .Select(p => new
							   {
								   Property = p,
								   Attributes = p.GetCustomAttributes(typeof(GridIncludeAttribute), true).Select(a => (GridIncludeAttribute)a),
								   VisibilityAttributes = p.GetCustomAttributes(typeof(GridColumnVisibilityAttribute), true).Select(a => (GridColumnVisibilityAttribute)a),
							   })
							   .Where(p => p.Attributes.Any() && p.VisibilityAttributes.All(a => a.IsVisible(null)))
							   .Select(p => new GridColumn { Property = p.Property, Attribute = p.Attributes.First() })
							   .ToList();
		}

		private static string GetColumnsJson(IEnumerable<GridColumn> gridColumns)
		{
			var needComma = false;
			var strBuilder = new StringBuilder();
			strBuilder.Append("[");

			var columnIndex = 0;
			foreach (var gridColumn in gridColumns)
			{
				if (needComma)
					strBuilder.Append(",");

				strBuilder.Append("{");
				strBuilder.AppendFormat("\"name\": \"{0}\",", gridColumn.Property.Name);
				strBuilder.AppendFormat("\"label\": \"{0}\",", gridColumn.Attribute.Label ?? gridColumn.Property.Name);
				strBuilder.AppendFormat("\"sortColumnName\": \"{0}\",", gridColumn.Attribute.SortColumnName ?? gridColumn.Property.Name);
				strBuilder.AppendFormat("\"index\": \"{0}\",", columnIndex++);
				strBuilder.AppendFormat("\"isSortable\": {0},", gridColumn.Attribute.IsSortable.ToString().ToLower());
				strBuilder.AppendFormat("\"includeType\": \"{0}\",", gridColumn.Attribute.IncludeType);
				strBuilder.AppendFormat("\"format\": \"{0}\"", gridColumn.Attribute.Format);
				strBuilder.Append("}");

				needComma = true;
			}

			strBuilder.Append("]");
			return strBuilder.ToString();
		}

		private static string GetRowsJson(IEnumerable<object> rows, IEnumerable<GridColumn> gridColumns)
		{
			var needComma = false;
			var strBuilder = new StringBuilder();
			strBuilder.Append("[");

			foreach (var row in rows)
			{
				if (needComma)
					strBuilder.Append(",");

				strBuilder.Append(GetRowJson(row, gridColumns));
				needComma = true;
			}

			strBuilder.Append("]");
			return strBuilder.ToString();
		}

		private static string GetRowJson(object row, IEnumerable<GridColumn> gridColumns)
		{
			var needComma = false;
			var strBuilder = new StringBuilder();
			strBuilder.Append("{");

			foreach (var gridColumn in gridColumns)
			{
				if (needComma)
					strBuilder.Append(",");

				strBuilder.AppendFormat("\"{0}\": {1}", gridColumn.Property.Name, GetValue(row, gridColumn));
				needComma = true;
			}

			strBuilder.Append("}");
			return strBuilder.ToString();
		}

		private static string GetValue(object row, GridColumn gridColumn)
		{
			var obj = gridColumn.Property.GetValue(row, null);
			if (obj == null)
				return "null";

			if (obj.GetType().IsPrimitive)
				return obj.ToString().ToLower();

			return string.Format("\"{0}\"", obj.ToString().HtmlEncode());
		}

		class GridColumn
		{
			public GridIncludeAttribute Attribute { get; set; }
			public PropertyInfo Property { get; set; }
		}
	}
}