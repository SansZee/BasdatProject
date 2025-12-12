USE INTEGRASI_DB
GO

-- ============================================================================
-- SP: sp_getTrendings - Return trending titles with consistent filmcard data
-- Uses: fnGetFilmCardDetail function
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_getTrendings
    @Limit INT = 6
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@Limit)
        f.title_id,
        f.name,
        f.startYear,
        f.vote_average,
        f.vote_count,
        f.genre_name
    FROM (
        SELECT TOP (@Limit)
            t.title_id
        FROM titles t
        JOIN dbo.FilterTitles() ft ON ft.title_id = t.title_id
        WHERE t.startYear >= YEAR(GETDATE()) - 1 OR t.endYear >= YEAR(GETDATE()) - 1
        ORDER BY t.vote_count DESC
    ) AS trending
    CROSS APPLY dbo.fnGetFilmCardDetail(trending.title_id) f;
END
GO

-- ============================================================================
-- SP: sp_getTopRated - Return top-rated titles with consistent filmcard data
-- Uses: fnGetFilmCardDetail function
-- ============================================================================
CREATE OR ALTER PROCEDURE sp_getTopRated
    @Limit INT = 6
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT TOP (@Limit)
        f.title_id,
        f.name,
        f.startYear,
        f.vote_average,
        f.vote_count,
        f.genre_name
    FROM (
        SELECT TOP (@Limit)
            t.title_id
        FROM titles t
        JOIN dbo.FilterTitles() ft ON ft.title_id = t.title_id
        WHERE t.vote_count >= 50000 
          AND (t.startYear = YEAR(GETDATE()) - 1 OR t.endYear >= YEAR(GETDATE()) - 1)
        ORDER BY t.vote_average DESC
    ) AS toprated
    CROSS APPLY dbo.fnGetFilmCardDetail(toprated.title_id) f;
END
GO

-- Test queries
EXEC sp_getTrendings @Limit = 6;
EXEC sp_getTopRated @Limit = 6;
