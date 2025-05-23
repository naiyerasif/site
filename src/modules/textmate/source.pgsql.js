// This is a TextMate grammar distributed by `rehype-starry-night`.
// This grammar is developed at
// <https://github.com/tkopets/sublime-postgresql-syntax>
// and licensed `bsd 3-clause license`.
// See <https://github.com/wooorm/starry-night> for more info.
/**
 * @import {Grammar} from '@wooorm/starry-night'
 */

/** @type {Grammar} */
const grammar = {
	names: ["pgsql", "postgresql", "postgres"],
	scopeName: "source.pgsql",
	extensions: [".pgsql", ".postgresql", ".postgres"],
	patterns: [
		{ include: "#comments" },
		{
			include: "#statement_create_function_view",
		},
		{ include: "#statement_create_other" },
		{ include: "#statement_commands" },
		{
			begin: "^(\\\\[\\S]+)",
			beginCaptures: {
				0: { name: "meta.preprocessor.pgsql" },
			},
			comment: "psql directives",
			end: "\\n",
			name: "meta.statement.pgsql.psql",
		},
	],
	repository: {
		comments: {
			patterns: [
				{
					captures: {
						1: {
							name: "punctuation.definition.comment.pgsql",
						},
					},
					match: "(--).*$\\n?",
					name: "comment.line.double-dash.pgsql",
				},
				{
					begin: "/\\*",
					captures: {
						0: {
							name: "punctuation.definition.comment.pgsql",
						},
					},
					end: "\\*/",
					name: "comment.block.c",
				},
			],
		},
		dollar_quotes: {
			patterns: [
				{
					begin: "(\\$[\\w_]*\\$)(?=\\s*[-\\/\\n\\r]+)",
					beginCaptures: {
						1: {
							name: "punctuation.dollar-quote.begin.pgsql",
						},
					},
					comment:
						"Assume multiline dollar quote is SQL body! Start if double dollar quote is followed by comment (-- or /**/) or linebreak (\n" +
						" or\n" +
						"). See match for dollar quotes as string: string.unquoted.dollar.pgsql. This could easily support other PL languages like PHP and Ruby -- see PHP heredoc as an example.",
					contentName: "meta.dollar-quote.pgsql",
					end: "\\1",
					endCaptures: {
						0: {
							name: "punctuation.dollar-quote.end.pgsql",
						},
					},
					patterns: [
						{ include: "#dollar_quotes" },
						{ include: "#comments" },
						{ include: "#strings" },
						{
							include: "#statement_create_function_view",
						},
						{
							include: "#statement_create_other",
						},
						{ include: "#keywords" },
						{ include: "#misc" },
						{ include: "#vars" },
						{ include: "#proc" },
					],
				},
			],
		},
		keywords: {
			patterns: [
				{
					captures: {
						1: { name: "support.function.pgsql" },
					},
					match:
						"(?xi)\\b(coalesce|nullif|greatest|least|abs|cbrt|ceil|ceiling|degrees|div|exp|floor|ln|log|mod|pi|power|radians|random|round|setseed|sign|sqrt|trunc|width_bucket|acos|asin|atan|atan2|cos|cot|sin|tan|bit_length|char_length|lower|octet_length|overlay|position|substring|trim|upper|ascii|btrim|chr|concat|concat_ws|convert|convert_from|convert_to|decode|encode|format|initcap|length|lpad|ltrim|md5|pg_client_encoding|quote_ident|quote_literal|quote_nullable|regexp_matches|regexp_replace|regexp_split_to_array|regexp_split_to_table|repeat|replace|reverse|rpad|rtrim|split_part|strpos|substr|to_ascii|to_hex|translate|get_bit|get_byte|set_bit|set_byte|to_char|to_date|to_number|to_timestamp|age|clock_timestamp|date_part|date_trunc|extract|isfinite|justify_days|justify_hours|justify_interval|make_date|make_interval|make_time|make_timestamp|make_timestamptz|now|statement_timestamp|timeofday|transaction_timestamp|enum_first|enum_last|enum_range|area|box|center|circle|diameter|height|isclosed|isopen|lseg|npoints|path|pclose|point|polygon|popen|radius|width|abbrev|abbrev|broadcast|family|host|hostmask|masklen|netmask|network|set_masklen|set_masklen|text|trunc|get_current_ts_config|numnode|plainto_tsquery|querytree|setweight|strip|to_tsquery|to_tsvector|ts_headline|ts_rank|ts_rank_cd|ts_rewrite|ts_rewrite|tsvector_update_trigger|tsvector_update_trigger_column|xmlattributes|xmlparse|xmlroot|xmlserialize|xmlcomment|xmlconcat|xmlelement|xmlforest|xmlpi|xmlexists|xml_is_well_formed|xml_is_well_formed_document|xml_is_well_formed_content|xpath|xpath_exists|table_to_xml|query_to_xml|cursor_to_xml|array_to_json|row_to_json|to_json|to_jsonb|json_array_length|jsonb_array_length|json_build_array|jsonb_build_array|json_build_object|jsonb_build_object|json_each|jsonb_each|json_each_text|jsonb_each_text|json_extract_path|jsonb_extract_path|json_extract_path_text|jsonb_extract_path_text|json_object|jsonb_object|json_object_keys|jsonb_object_keys|json_populate_record|jsonb_populate_record|json_populate_recordset|jsonb_populate_recordset|json_array_elements|jsonb_array_elements|json_array_elements_text|jsonb_array_elements_text|json_typeof|jsonb_typeof|json_to_record|jsonb_to_record|json_to_recordset|jsonb_to_recordset|json_strip_nulls|jsonb_strip_nulls|jsonb_pretty|jsonb_set|currval|lastval|nextval|setval|array_append|array_cat|array_ndims|array_dims|array_fill|array_length|array_lower|array_prepend|array_position|array_positions|array_remove|array_replace|array_to_string|array_upper|string_to_array|cardinality|unnest|isempty|lower_inc|upper_inc|lower_inf|upper_inf|generate_series|generate_subscripts|current_database|current_query|current_schema|current_schemas)\\b\\s*\\(",
				},
				{
					captures: {
						1: { name: "support.function.pgsql" },
					},
					match:
						"(?xi)\\b(pg_sleep|pg_sleep_for|pg_sleep_until|inet_client_addr|inet_client_port|inet_server_addr|inet_server_port|pg_backend_pid|pg_conf_load_time|pg_is_other_temp_schema|pg_listening_channels|pg_my_temp_schema|pg_postmaster_start_time|pg_trigger_depth|version|txid_current|txid_current_snapshot|txid_snapshot_xip|txid_snapshot_xmax|txid_snapshot_xmin|txid_visible_in_snapshot|current_setting|set_config|pg_cancel_backend|pg_reload_conf|pg_replication_origin_create|pg_replication_origin_drop|pg_replication_origin_session_setup|pg_replication_origin_xact_setup|pg_replication_origin_progress|pg_replication_origin_session_progress|pg_rotate_logfile|pg_terminate_backend|pg_create_restore_point|pg_current_xlog_insert_location|pg_current_xlog_location|pg_start_backup|pg_stop_backup|pg_is_in_backup|pg_backup_start_time|pg_switch_xlog|pg_xact_commit_timestamp|pg_xlogfile_name|pg_xlogfile_name_offset|pg_xlog_location_diff|has_any_column_privilege|has_column_privilege|has_database_privilege|has_foreign_data_wrapper_privilege|has_function_privilege|has_language_privilege|has_schema_privilege|has_sequence_privilege|has_server_privilege|has_table_privilege|has_tablespace_privilege|pg_has_role|pg_collation_is_visible|pg_conversion_is_visible|pg_function_is_visible|pg_opclass_is_visible|pg_operator_is_visible|pg_opfamily_is_visible|pg_table_is_visible|pg_ts_config_is_visible|pg_ts_dict_is_visible|pg_ts_parser_is_visible|pg_ts_template_is_visible|pg_type_is_visible|format_type|pg_describe_object|pg_identify_object|pg_identify_object_as_address|pg_get_constraintdef|pg_get_expr|pg_get_functiondef|pg_get_function_arguments|pg_get_function_identity_arguments|pg_get_function_result|pg_get_indexdef|pg_get_keywords|pg_get_object_address|pg_get_ruledef|pg_get_serial_sequence|pg_get_triggerdef|pg_get_userbyid|pg_get_viewdef|pg_options_to_table|pg_tablespace_databases|pg_tablespace_location|pg_typeof|to_regclass|to_regproc|to_regprocedure|to_regoper|to_regoperator|to_regtype|col_description|obj_description|shobj_description|pg_is_in_recovery|pg_last_committed_xact|pg_last_xlog_receive_location|pg_last_xlog_replay_location|pg_last_xact_replay_timestamp|pg_is_xlog_replay_paused|pg_xlog_replay_pause|pg_xlog_replay_resume|pg_export_snapshot|pg_column_size|pg_database_size|pg_indexes_size|pg_relation_size|pg_size_pretty|pg_table_size|pg_tablespace_size|pg_total_relation_size|pg_relation_filenode|pg_relation_filepath|pg_filenode_relation|pg_ls_dir|pg_read_file|pg_read_binary_file|pg_stat_file|pg_stat_get_snapshot_timestamp|pg_advisory_lock|pg_advisory_lock_shared|pg_advisory_unlock|pg_advisory_unlock_all|pg_advisory_unlock_shared|pg_advisory_xact_lock|pg_advisory_xact_lock_shared|pg_try_advisory_lock|pg_try_advisory_lock_shared|pg_try_advisory_xact_lock|pg_try_advisory_xact_lock_shared|suppress_redundant_updates_trigger|pg_event_trigger_ddl_commands|pg_event_trigger_dropped_objects)\\b\\s*\\(",
				},
				{
					captures: {
						1: { name: "support.function.pgsql" },
					},
					match:
						"(?xi)\\b(array_agg|avg|bit_and|bit_or|bool_and|bool_or|count|every|json_agg|jsonb_agg|json_object_agg|jsonb_object_agg|max|min|string_agg|sum|xmlagg|corr|covar_pop|covar_samp|regr_avgx|regr_avgy|regr_count|regr_intercept|regr_r2|regr_slope|regr_sxx|regr_sxy|regr_syy|stddev|stddev_pop|stddev_samp|variance|var_pop|var_samp|mode|percentile_cont|percentile_disc|row_number|rank|dense_rank|percent_rank|cume_dist|ntile|lag|lead|first_value|last_value|nth_value)\\b\\s*\\(",
				},
				{
					match:
						"(?i)\\b(current_catalog|current_date|current_role|current_schema|current_time|current_timestamp|current_user|session_user|localtime|localtimestamp)\\b",
					name: "support.function.pgsql",
				},
				{
					match:
						"(?i)\\b(aclitem|anyelement|anyarray|anynonarray|anyenum|anyrange|cstring|internal|language_handler|fdw_handler|void|opaque|smallint|integer|int|bigint|int2|int4|int8|numeric|decimal|dec|double(?:\\s+precision)?|real|float|float4|float8|smallserial|serial|bigserial|text|varchar|character\\s+varying|char|character|bpchar|name|bytea|bool|boolean|date|time|timestamp|with(out)?\\s+time\\s+zone|timetz|timestamptz|tinterval|interval|point|lseg|box|line|path|polygon|circle|cidr|inet|macaddr|bit|varbit|bit\\s+varying|tsvector|tsquery|uuid|xml|json|jsonb|txid_snapshot|money|oid|oidvector|int2range|int4range|int8range|numrange|tsrange|tstzrange|daterange|event_trigger|cid|xid|tid|regclass|regconfig|regdictionary|regoper|regoperator|regproc|regprocedure|reltime|abstime|record)\\b",
					name: "storage.type.pgsql",
				},
				{
					captures: {
						1: { name: "keyword.other.pgsql" },
					},
					match:
						"(?xi)\\b(abort|access\\s+share|access\\s+exclusive|add|admin|after|aggregate|all|also|alter|always|analyse|analyze|and|any|array|as|as\\s+assignment|as\\s+implicit|asc|asymmetric|at|at\\s+time\\s+zone|attribute|authorization|before|begin|between|by|bypassrls|cache|called\\s+on\\s+null\\s+input|null\\s+on\\s+null\\s+input|strict|is\\s+null|not\\s+null|is\\s+true|is\\s+not\\s+true|is\\s+false|is\\s+not\\s+false|cascade|case|cast|characteristics|check|checkpoint|close|cluster|collate|collation|column|comment|comments|commit|concurrently|configuration|connection|constraint|constraints|continue|conversion|copy|cost|create|createdb|createrole|createuser|cross\\s+join|csv|cube|current|cursor|cycle|data|database|day|ddl_command_start|ddl_command_end|deallocate|declare|default|defaults|deferrable|deferred|delete|delimiter|delimiters|desc|dictionary|disable|discard|distinct|do|document|domain|drop|each|else|enable|encoding|encrypted|end|enum|escape|event|except|exclude|excluding|exclusive|execute|exists|explain|extension|external|family|absolute|relative|prior|backward|forward|fetch|fillfactor|first|following|for|force|foreign|freeze|from|full|function|all\\s+functions|on\\s+functions|generated|global|grant|group|grouping\\s+sets|handler|having|header|hold|hour|identity|if|ilike|immediate|immutable|in|including|increment|index|indexes|inherit|inherits|initially\\s+deferred|initially\\s+immediate|inline|inner|inout|input|insensitive|insert|instead|intersect|into|is|isnull|isolation\\s+level|join|key|label|language|last|lateral|lc_collate|lc_ctype|left|like|limit|listen|load|local|locale|location|lock|logged|login|mapping|match|materialized|maxvalue|minute|minvalue|mode|month|move|names|natural|next|no\\s+action|no|none|nobypassrls|nocreatedb|nocreaterole|nocreateuser|noinherit|nologin|noreplication|nosuperuser|not|nothing|notify|notnull|nowait|nullif|nulls|of|off|offset|oids|on\\s+conflict|on|only|operator\\s+class|operator|option|options|or|order|out|outer\\s+join|over|overlaps|overriding|owned|owner|parser|partial|partition|password|plans|plpgsql|policy|position|preceding|prepare|prepared|preserve\\s+rows|primary|privileges|procedural|procedure|program|quote|range|read\\s+committed|read\\s+uncommitted|read|reassign|recheck|recursive|refcursor|references|refresh|reindex|release|rename|repeatable|replace|replica|replication|reset|restart|restrict|returning|returns|revoke|right|role|rollback|rollup|row\\s+level|row|rows|rule|savepoint|schema|scroll|search|second|security\\s+definer|security\\s+invoker|security|select|session_user|sequence|sequences|serializable|server|session|set|setof|share|show|similar|simple|skip\\s+locked|some|stable|start|statement|statistics|stdin|stdout|storage|symmetric|system|sql|sql_drop|superuser|table|tables|tablesample\\s+bernoulli|tablesample\\s+system|tablesample|tablespace|temp|template|temporary|then|to|trailing|transaction|transform|trigger|trim|truncate|trusted|type|unbounded\\s+preceding|unbounded\\s+following|unencrypted|union|unique|unknown|unlisten|unlogged|update|usage|user|using|vacuum|valid\\s+until|valid|validate|validator|value|values|variadic|verbose|version|view|volatile|when\\s+tag|when|where|window|with\\s+cascaded|with\\s+ordinality|with|within|without|work|wrapper|write|year|yes|parallel\\s+(unsafe|restricted|safe)|leakproof|filter)\\b",
				},
			],
		},
		misc: {
			patterns: [
				{
					match: "\\b\\d+\\b",
					name: "constant.numeric.pgsql",
				},
				{
					match: "->>|->|#>>|#>",
					name: "keyword.operator.json.pgsql",
				},
				{
					match: "\\?&|\\?\\||\\?",
					name: "keyword.operator.jsonb.pgsql",
				},
				{
					match: "~|~\\*!~|!~\\*",
					name: "keyword.operator.regex.pgsql",
				},
				{
					match: "@@|&&|!!|@>|<@",
					name: "keyword.operator.tsearch.pgsql",
				},
				{
					match: "\\*",
					name: "keyword.operator.star.pgsql",
				},
				{
					match: "[!<>]?=|<>|<|>",
					name: "keyword.operator.comparison.pgsql",
				},
				{
					match: "-|\\+|/|\\^",
					name: "keyword.operator.math.pgsql",
				},
				{
					match: "\\|\\|",
					name: "keyword.operator.concatenator.pgsql",
				},
				{
					match: "::",
					name: "keyword.operator.cast.pgsql",
				},
				{
					match: "(?i)\\b(true|false|null)\\b",
					name: "constant.language.pgsql",
				},
			],
		},
		proc: {
			patterns: [
				{
					match:
						"(?xi)\\b(case|continue|else|elseif|elsif|exit|for|foreach|if|loop|return(?:(?:\\s+next)|(?:\\s+query))?|slice|then|when|while|reverse)\\b",
					name: "keyword.control.proc.pgsql",
				},
				{
					match:
						"(?xi)\\b(alias|begin|constant|declare|end|exception|execute|get\\s+(?:stacked\\s+)?diagnostics|perform|raise|using|message|detail|hint|errcode|debug|log|info|notice|warning)\\b",
					name: "keyword.other.proc.pgsql",
				},
				{
					match:
						"(?xi)\\b(found|sqlerrm|sqlstate|new|old|tg_name|tg_when|tg_level|tg_op|tg_relid|tg_relname|tg_table_name|tg_table_schema|tg_nargs|tg_argv|tg_event|tg_tag)\\b",
					name: "support.function.proc.pgsql",
				},
				{
					match: "(?i)\\b([-a-z0-9_.]+%(row)?type)\\b",
					name: "storage.type.proc.pgsql",
				},
				{
					match: "\\$\\d+",
					name: "variable.parameter.pgsql",
				},
			],
		},
		statement_commands: {
			begin:
				"(?i:^\\s*(abort|alter|analyze|begin|checkpoint|close|cluster|comment|commit|copy|create|deallocate|declare|delete|discard|do|drop|end|execute|explain|fetch|grant|import|insert|listen|load|lock|move|notify|prepare|reassign|refresh|reindex|release|reset|revoke|rollback|savepoint|security|select|set|show|start|table|truncate|unlisten|update|vacuum|values|with))",
			beginCaptures: {
				1: { name: "keyword.other.pgsql" },
			},
			end: ";\\s*",
			name: "meta.statement.pgsql",
			patterns: [
				{ include: "#dollar_quotes" },
				{ include: "#comments" },
				{ include: "#strings" },
				{ include: "#keywords" },
				{ include: "#misc" },
			],
		},
		statement_create_function_view: {
			begin:
				'(?i)^\\s*(create)\\s+(or\\s+replace\\s+)?(function|view|procedure)\\s+(?:([\\w]+|".+")\\.)?([\\w]+|".+")(?:[\\(|\\s)])',
			beginCaptures: {
				1: { name: "keyword.other.create.pgsql" },
				2: { name: "keyword.other.pgsql" },
				3: { name: "keyword.other.pgsql" },
				4: {
					name: "entity.other.inherited-class.pgsql",
				},
				5: { name: "entity.name.function.pgsql" },
			},
			end: ";\\s*",
			name: "meta.statement.create.pgsql",
			patterns: [
				{ include: "#dollar_quotes" },
				{ include: "#comments" },
				{ include: "#strings" },
				{ include: "#keywords" },
				{ include: "#misc" },
				{ include: "#vars" },
				{ include: "#proc" },
			],
		},
		statement_create_other: {
			begin:
				'(?i:^\\s*(create)\\s+(aggregate|collation|(?:default\\s+)?conversion|database|domain|extension(?:\\s+if\\s+not\\s+exists)?|foreign\\s+data\\s+wrapper|foreign\\s+table(?:\\s+if\\s+not\\s+exists)?|group|(?:unique\\s+)?index(?!\\s+on)(?:\\s+concurrently)?(?:\\s+if\\s+not\\s+exists)?|(?:or\\s+replace\\s+)?(?:trusted\\s+)?(?:procedural\\s+)?language|operator\\s+class|operator\\s+family|operator|policy|role|(?:or\\s+replace\\s+)?rule|schema(?:\\s+if\\s+not\\s+exists)?(?:\\s+authorization)?|(?:(?:temporary|temp)\\s+)?sequence(?:\\s+if\\s+not\\s+exists)?|server|(?:(?:global|local)\\s+)?(?:(?:temporary|temp)\\s+)?(?:unlogged\\s+)?table(?:\\s+if\\s+not\\s+exists)?|tablespace|text\\s+search\\s+configuration|text\\s+search\\s+dictionary|text\\s+search\\s+parser|text\\s+search\\s+template|(?:(?:constraint|event)\\s+)?trigger|type|user\\s+mapping\\s+for|user|materialized\\s+view(?:\\s+if\\s+not\\s+exists)?|(?:or\\s+replace\\s+)?(?:(?:temporary|temp)\\s+)?(?:recursive\\s+)?view)\\s+)(?:([\\w]+|".+")\\.)?([\\w]+|".+")(?=[\\(|\\s|\\;)])',
			beginCaptures: {
				1: { name: "keyword.other.create.pgsql" },
				2: { name: "keyword.other.pgsql" },
				3: {
					name: "entity.other.inherited-class.pgsql",
				},
				4: { name: "entity.name.function.pgsql" },
			},
			end: ";\\s*",
			name: "meta.statement.create.pgsql",
			patterns: [
				{ include: "#dollar_quotes" },
				{ include: "#comments" },
				{ include: "#strings" },
				{ include: "#keywords" },
				{ include: "#misc" },
			],
		},
		string_escape: {
			match: "\\\\.",
			name: "constant.character.escape.pgsql",
		},
		strings: {
			patterns: [
				{
					captures: {
						1: {
							name: "punctuation.definition.string.begin.pgsql",
						},
						3: {
							name: "punctuation.definition.string.end.pgsql",
						},
					},
					comment:
						"This is faster than the next begin/end rule since sub-pattern will match till end-of-line and SQL files tend to have very long lines.",
					match: "(')[^'\\\\]*(')",
					name: "string.quoted.single.pgsql",
				},
				{
					begin: "'",
					beginCaptures: {
						0: {
							name: "punctuation.definition.string.begin.pgsql",
						},
					},
					comment:
						"Need to implement escape rule with two single quotes in a row. Lots of other escaping issues with single quotes.",
					end: "'",
					endCaptures: {
						0: {
							name: "punctuation.definition.string.end.pgsql",
						},
					},
					name: "string.quoted.single.pgsql",
					patterns: [{ include: "#string_escape" }],
				},
				{
					comment: "Double quoting treated like strings, but they are really identifiers.",
					match: '(")[^"#]*(")',
					name: "variable.other.pgsql",
				},
				{
					begin: "(\\$[\\w_]*\\$)",
					comment:
						"Color double dollar quotes as a string Only if not followed by comment or linebreak, see meta.dollar-quote.pgsql.",
					end: "\\1",
					name: "string.unquoted.dollar.pgsql",
				},
			],
		},
		vars: {
			patterns: [
				{
					match: "(?i)\\b(_[-a-z0-9_]+)\\b",
					name: "variable.parameter.pgsql",
				},
				{
					match: "(?i)\\b(p(i|t|b|n|c|d|r|ia|iv(?:al)?)_[-a-z0-9_]+)\\b",
					name: "variable.parameter.pgsql",
				},
				{
					match: "(?i)\\b(v(i|t|b|n|c|d|r|ia|iv(?:al)?)_[-a-z0-9_]+)\\b",
					name: "variable.parameter.pgsql",
				},
			],
		},
	},
};

export default grammar;
