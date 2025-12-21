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


CREATE OR ALTER PROCEDURE dbo.sp_filter_titles_filmcard
    @GenreId NVARCHAR(40) = NULL,
    @TypeId NVARCHAR(40) = NULL,
    @StatusId NVARCHAR(40) = NULL,
    @OriginCountryId NVARCHAR(40) = NULL,
    @ProductionCountryId NVARCHAR(40) = NULL,
    @Year SMALLINT = NULL,
    @SortBy NVARCHAR(50) = NULL,  
    @Page INT = 1,
    @Limit INT = 20
AS
BEGIN
    SET NOCOUNT ON;

    IF (@Page - 1) * @Limit >= 200
        RETURN;

    DECLARE @Offset INT = (@Page - 1) * @Limit;
    DECLARE @OrderBy NVARCHAR(200);

    SET @OrderBy =
        CASE @SortBy
            WHEN 'release_date' THEN 't.startYear DESC'
            WHEN 'most_viewed'  THEN 't.vote_count DESC'
            WHEN 'imdb_rating'  THEN 't.vote_average DESC'
            WHEN 'name'         THEN 't.primaryTitle ASC'
            ELSE 't.vote_count DESC'
        END + ', t.title_id ASC'; 

    DECLARE @SQL NVARCHAR(MAX) = N'
    /* STEP 1: kandidat (maks 200) */
    SELECT TOP (200)
        t.title_id
    INTO #CandidateTitles
    FROM dbo.titles t
    JOIN dbo.FilterTitles() ft ON ft.title_id = t.title_id
    WHERE (@TypeId IS NULL OR t.type_id = @TypeId)
      AND (@StatusId IS NULL OR t.status_id = @StatusId)
      AND (@Year IS NULL OR t.startYear = @Year)
      AND (
            @GenreId IS NULL OR EXISTS (
                SELECT 1
                FROM dbo.genres g
                WHERE g.title_id = t.title_id
                  AND g.genre_type_id = @GenreId
            )
      )
    ORDER BY ' + @OrderBy + ';

    /* STEP 2: pagination */
    WITH Paged AS (
        SELECT
            c.title_id,
            ROW_NUMBER() OVER (ORDER BY ' + @OrderBy + ') AS rn
        FROM #CandidateTitles c
        JOIN dbo.titles t ON t.title_id = c.title_id
    )
    SELECT f.*
    FROM Paged p
    CROSS APPLY dbo.fnGetFilmCardDetail(p.title_id) f
    WHERE p.rn > @Offset
      AND p.rn <= (@Offset + @Limit)
    ORDER BY p.rn;
    ';

    EXEC sp_executesql
        @SQL,
        N'@GenreId NVARCHAR(40),
          @TypeId NVARCHAR(40),
          @StatusId NVARCHAR(40),
          @Year SMALLINT,
          @Offset INT,
          @Limit INT',
        @GenreId,
        @TypeId,
        @StatusId,
        @Year,
        @Offset,
        @Limit;
END
GO



-- Test
SET STATISTICS IO ON;
SET STATISTICS TIME ON;

EXEC sp_filter_titles_filmcard 
    @Page = 1
    @Limit = 20;

SELECT * FROM sys.tables;

SELECT @@VERSION;