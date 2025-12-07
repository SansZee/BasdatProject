CREATE OR ALTER PROCEDURE sp_filter_titles
    @GenreId NVARCHAR(40) = NULL,
    @TypeId NVARCHAR(40) = NULL,
    @StatusId NVARCHAR(40) = NULL,
    @OriginCountryId NVARCHAR(40) = NULL,
    @ProductionCountryId NVARCHAR(40) = NULL,
    @Year SMALLINT = NULL,
    @SortBy NVARCHAR(50) = NULL,      -- name, popularity, rating, released
    @Page INT = 1,                     -- Page number for pagination
    @Limit INT = 20                    -- Items per page
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE 
        @sql NVARCHAR(MAX) = N'
        SELECT t.*
        FROM (
            SELECT DISTINCT t.title_id
            FROM titles t
        ',
        @where NVARCHAR(MAX) = N' WHERE 1=1 ',
        @params NVARCHAR(MAX) = N'
            @GenreId NVARCHAR(40),
            @TypeId NVARCHAR(40),
            @StatusId NVARCHAR(40),
            @OriginCountryId NVARCHAR(40),
            @ProductionCountryId NVARCHAR(40),
            @Year SMALLINT,
            @SortBy NVARCHAR(50),
            @Page INT,
            @Limit INT
        ';

    ---------------------------------------------------
    -- JOIN GENRE
    ---------------------------------------------------
    IF (@GenreId IS NOT NULL)
        SET @sql += '
            JOIN genres g ON g.title_id = t.title_id
        ';

    ---------------------------------------------------
    -- JOIN ORIGIN COUNTRY
    ---------------------------------------------------
    IF (@OriginCountryId IS NOT NULL)
        SET @sql += '
            JOIN production_countries oc 
                ON oc.title_id = t.title_id
                AND oc.origin_country_type_id = @OriginCountryId
        ';

    ---------------------------------------------------
    -- JOIN PRODUCTION COUNTRY
    ---------------------------------------------------
    IF (@ProductionCountryId IS NOT NULL)
        SET @sql += '
            JOIN production_countries pc 
                ON pc.title_id = t.title_id
                AND pc.production_country_type_id = @ProductionCountryId
        ';

    ---------------------------------------------------
    -- WHERE FILTERS
    ---------------------------------------------------

    -- Genre
    IF (@GenreId IS NOT NULL)
        SET @where += ' AND g.genre_type_id = @GenreId ';

    -- Type
    IF (@TypeId IS NOT NULL)
        SET @where += ' AND t.type_id = @TypeId ';

    -- Status
    IF (@StatusId IS NOT NULL)
        SET @where += ' AND t.status_id = @StatusId ';

    -- Year
    IF (@Year IS NOT NULL)
        SET @where += ' AND t.startYear = @Year ';

    ---------------------------------------------------
    -- ORDER BY
    ---------------------------------------------------
    SET @sql += @where;

    SET @sql += '
        ) AS distinct_titles
        INNER JOIN titles t ON t.title_id = distinct_titles.title_id
        ORDER BY 
            CASE WHEN @SortBy = ''name'' THEN t.name END,
            CASE WHEN @SortBy = ''popularity'' THEN t.popularity END DESC,
            CASE WHEN @SortBy = ''rating'' THEN t.vote_average END DESC,
            CASE WHEN @SortBy = ''released'' THEN t.startYear END DESC
        OFFSET (@Page - 1) * @Limit ROWS
        FETCH NEXT @Limit ROWS ONLY
    ';

    ---------------------------------------------------
    -- EXECUTE
    ---------------------------------------------------
    EXEC sp_executesql 
        @sql,
        @params,
        @GenreId,
        @TypeId,
        @StatusId,
        @OriginCountryId,
        @ProductionCountryId,
        @Year,
        @SortBy,
        @Page,
        @Limit;
END
GO
