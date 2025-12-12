USE INTEGRASI_DB
GO

CREATE OR ALTER PROCEDURE sp_filter_titles_filmcard
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

    DECLARE @Offset INT = (@Page - 1) * @Limit;

    WITH filtered_titles AS (
        SELECT TOP (1000)
            t.title_id,
            ROW_NUMBER() OVER (ORDER BY t.vote_count DESC) AS rn
        FROM titles t
        JOIN dbo.FilterTitles() ft ON ft.title_id = t.title_id
        LEFT JOIN genres g ON g.title_id = t.title_id
        WHERE (t.type_id = @TypeId OR @TypeId IS NULL)
          AND (t.status_id = @StatusId OR @StatusId IS NULL)
          AND (t.startYear = @Year OR @Year IS NULL)
          AND (g.genre_type_id = @GenreId OR @GenreId IS NULL)
    )
    SELECT f.*
    FROM filtered_titles ft
    CROSS APPLY dbo.fnGetFilmCardDetail(ft.title_id) f
    WHERE ft.rn > @Offset AND ft.rn <= (@Offset + @Limit)
    ORDER BY ft.rn;
END
GO

-- Test
EXEC sp_filter_titles_filmcard 
    @Page = 1,
    @Limit = 20;
