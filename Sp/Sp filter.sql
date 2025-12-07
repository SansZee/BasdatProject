USE INTEGRASI_DB
-- Filter Type
CREATE INDEX IX_titles_type ON titles(type_id);

-- Filter Status
CREATE INDEX IX_titles_status ON titles(status_id);

-- Filter Start Year
CREATE INDEX IX_titles_startYear ON titles(startYear);

-- Sorting by popularity & rating
CREATE INDEX IX_titles_popularity ON titles(popularity);
CREATE INDEX IX_titles_vote ON titles(vote_average);

-- Genre filtering
CREATE INDEX IX_genres_title_genre ON genres(title_id, genre_type_id);

-- Origin & Production countries
CREATE INDEX IX_production_countries_origin ON production_countries(origin_country_type_id, title_id);
CREATE INDEX IX_production_countries_prod ON production_countries(production_country_type_id, title_id);
-------- sp filter --------------------------
ALTER PROCEDURE sp_filter_titles
    @GenreId NVARCHAR(40) = NULL,
    @TypeId NVARCHAR(40) = NULL,
    @StatusId NVARCHAR(40) = NULL,
    @OriginCountryId NVARCHAR(40) = NULL,
    @ProductionCountryId NVARCHAR(40) = NULL,
    @Year SMALLINT = NULL,
    @SortBy NVARCHAR(50) = NULL,
    @Page INT = 1,              -- NEW pagination
    @Limit INT = 20             -- NEW pagination (20 per halaman)
AS
BEGIN
    SET NOCOUNT ON;

    ---------------------------------------------------------
    -- HITUNG OFFSET
    ---------------------------------------------------------
    DECLARE @Offset INT = (@Page - 1) * @Limit;

    ---------------------------------------------------------
    -- BASE QUERY (AMBIL MAKSIMUM 1000 DATA BERDASARKAN VOTE_COUNT DESC)
    ---------------------------------------------------------
    DECLARE 
        @sql NVARCHAR(MAX) = N'
        SELECT *
        FROM (
            SELECT TOP (1000)
                t.*
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
            @Offset INT,
            @Limit INT
        ';

    ---------------------------------------------------------
    -- OPTIONAL JOINS
    ---------------------------------------------------------
    IF (@GenreId IS NOT NULL)
        SET @sql += '
            JOIN genres g ON g.title_id = t.title_id
        ';

    IF (@OriginCountryId IS NOT NULL)
        SET @sql += '
            JOIN production_countries oc 
                ON oc.title_id = t.title_id
        ';

    IF (@ProductionCountryId IS NOT NULL)
        SET @sql += '
            JOIN production_countries pc 
                ON pc.title_id = t.title_id
        ';

    ---------------------------------------------------------
    -- WHERE FILTERS
    ---------------------------------------------------------
    IF (@GenreId IS NOT NULL)
        SET @where += ' AND g.genre_type_id = @GenreId ';

    IF (@TypeId IS NOT NULL)
        SET @where += ' AND t.type_id = @TypeId ';

    IF (@StatusId IS NOT NULL)
        SET @where += ' AND t.status_id = @StatusId ';

    IF (@OriginCountryId IS NOT NULL)
        SET @where += ' AND oc.origin_country_type_id = @OriginCountryId ';

    IF (@ProductionCountryId IS NOT NULL)
        SET @where += ' AND pc.production_country_type_id = @ProductionCountryId ';

    IF (@Year IS NOT NULL)
        SET @where += ' AND t.startYear = @Year ';

    SET @sql += @where;

    ---------------------------------------------------------
    -- ORDER BY UNTUK MEMILIH 1000 DATA TERATAS
    -- DEFAULT: vote_count DESC
    ---------------------------------------------------------
    IF (@SortBy = 'name')
        SET @sql += ' ORDER BY t.name ';
    ELSE IF (@SortBy = 'popularity')
        SET @sql += ' ORDER BY t.popularity DESC ';
    ELSE IF (@SortBy = 'rating')
        SET @sql += ' ORDER BY t.vote_average DESC ';
    ELSE IF (@SortBy = 'released')
        SET @sql += ' ORDER BY t.startYear DESC ';
    ELSE IF (@SortBy = 'votes')
        SET @sql += ' ORDER BY t.vote_count DESC ';
    ELSE
        SET @sql += ' ORDER BY t.vote_count DESC ';   -- ★ DEFAULT BARU by VOTE_COUNT

    ---------------------------------------------------------
    -- CLOSING SUBQUERY + PAGINATION
    ---------------------------------------------------------
    SET @sql += N'
        ) AS limited
        ORDER BY limited.vote_count DESC      -- ★ PAGINATION juga berdasarkan vote_count
        OFFSET @Offset ROWS
        FETCH NEXT @Limit ROWS ONLY;
    ';

    ---------------------------------------------------------
    -- EXECUTE
    ---------------------------------------------------------
    EXEC sp_executesql 
        @sql,
        @params,
        @GenreId,
        @TypeId,
        @StatusId,
        @OriginCountryId,
        @ProductionCountryId,
        @Year,
        @Offset,
        @Limit;
END
GO

SELECT TOP 20 *
FROM titles


EXEC sp_filter_titles 
    @GenreId = 'genre-action',
    @TypeId = 'type-movie',
    @StatusId = 'status-released',
    @OriginCountryId = NULL,
    @ProductionCountryId = NULL,
    @Year = NULL,
    @SortBy = 'rating';
EXEC sp_filter_titles 
    @GenreId = NULL,
    @TypeId = NULL,
    @StatusId = NULL,
    @OriginCountryId = NULL,
    @ProductionCountryId = NULL,
    @Year = NULL,
    @SortBy = NULL;

