USE INTEGRASI_DB
GO

CREATE NONCLUSTERED INDEX IX_titles_filter_sort
ON dbo.titles (
    type_id,
    status_id,
    startYear,
    vote_count DESC
)
INCLUDE (title_id);

CREATE NONCLUSTERED INDEX IX_titles_title_id
ON dbo.titles(title_id);

CREATE NONCLUSTERED INDEX IX_genres_genre_title
ON dbo.genres (
    genre_type_id,
    title_id
);
CREATE NONCLUSTERED INDEX IX_genres_title
ON genres (title_id)
INCLUDE (genre_type_id);

CREATE NONCLUSTERED INDEX IX_genre_types_id
ON genre_types (genre_type_id)
INCLUDE (genre_name);





-- Test
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

EXEC sp_filter_titles_filmcard 
    @Page = 1
    @Limit = 20;

SELECT * FROM sys.tables;

SELECT @@VERSION;