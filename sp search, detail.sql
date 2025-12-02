USE INTEGRASI_DB
-- Indexing: ----------------------------------------
-- search
CREATE FULLTEXT CATALOG FTCatalog_Titles
WITH ACCENT_SENSITIVITY = OFF;
GO
CREATE FULLTEXT INDEX ON titles
(
    name LANGUAGE 1033,
    original_name LANGUAGE 1033
)
KEY INDEX PK_titles
ON FTCatalog_Titles
WITH CHANGE_TRACKING AUTO;
GO
-- detail
ALTER DATABASE INTEGRASI_DB SET RECOVERY SIMPLE;
GO
SELECT name, physical_name 
FROM sys.database_files;
DBCC SHRINKFILE (INTEGRASI_DB_log, 50); -- 50 MB atau ukuran lain
GO
ALTER DATABASE INTEGRASI_DB 
MODIFY FILE (
    NAME = INTEGRASI_DB_log,
    SIZE = 5024MB,
    FILEGROWTH = 500MB
);

CREATE INDEX idx_genres_title ON genres(title_id);
CREATE INDEX idx_languages_title ON languages(title_id);
CREATE INDEX idx_spoken_languages_title ON spoken_languages(title_id);
CREATE INDEX idx_prodcomp_title ON production_companies(title_id);
CREATE INDEX idx_prodcountry_title ON production_countries(title_id);
CREATE INDEX idx_networks_title ON networks(title_id);
CREATE INDEX idx_airdates_title ON air_dates(title_id);
CREATE INDEX idx_titleprincipals_title ON title_principals(title_id, ordering);


--- Procedure ---------------------------------------
-- Search
ALTER PROCEDURE sp_SearchTitles
    @keyword NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @sql NVARCHAR(MAX);
    DECLARE @search NVARCHAR(200);

    SET @search = '"' + @keyword + '"';

    SET @sql = '
        SELECT TOP 15
            title_id,
            name,
            overview,
            vote_average
        FROM titles
        WHERE CONTAINS((name, original_name), ' + QUOTENAME(@search, '''') + ')
        ORDER BY vote_count DESC;
    ';

    EXEC(@sql);
END
GO


EXEC sp_SearchTitles 'breaking bad';
SELECT FULLTEXTCATALOGPROPERTY('FTCatalog_Titles', 'PopulateStatus') AS status;
use INTEGRASI_DB
-- Detail
CREATE OR ALTER PROCEDURE sp_GetTitleDetail
    @title_id NVARCHAR(40)
AS
BEGIN
    SET NOCOUNT ON;

    -----------------------------------------------------
    -- 1. DETAIL UTAMA TITLE
    -----------------------------------------------------
    SELECT 
        t.title_id,
        t.name,
        t.original_name,
        t.overview,
        t.popularity,
        t.vote_average,
        t.vote_count,
        t.runtimeMinutes,
        t.startYear,
        t.endYear,
        t.number_of_seasons,
        t.number_of_episodes,
        ty.type_name,
        s.status_name,
        t.tagline
    FROM titles t
    LEFT JOIN types ty ON t.type_id = ty.type_id
    LEFT JOIN status s ON t.status_id = s.status_id
    WHERE t.title_id = @title_id;


    -----------------------------------------------------
    -- 2. GENRES
    -----------------------------------------------------
    SELECT 
        gt.genre_name
    FROM genres g
    JOIN genre_types gt ON g.genre_type_id = gt.genre_type_id
    WHERE g.title_id = @title_id;


    -----------------------------------------------------
    -- 3. BAHASA
    -----------------------------------------------------
    SELECT
        lt.language_name
    FROM languages l
    JOIN language_types lt ON l.language_type_id = lt.language_type_id
    WHERE l.title_id = @title_id;


    -----------------------------------------------------
    -- 4. NEGARA PRODUKSI
    -----------------------------------------------------
    SELECT
        pct.production_country_name
    FROM production_countries pc
    JOIN production_country_types pct 
        ON pc.production_country_type_id = pct.production_country_type_id
    WHERE pc.title_id = @title_id;


    -----------------------------------------------------
    -- 5. PERUSAHAAN PRODUKSI
    -----------------------------------------------------
    SELECT
        pct.production_company_name
    FROM production_companies pc
    JOIN production_company_types pct 
        ON pc.production_company_type_id = pct.production_company_type_id
    WHERE pc.title_id = @title_id;


    -----------------------------------------------------
    -- 6. NETWORKS
    -----------------------------------------------------
    SELECT 
        nt.network_name
    FROM networks n
    JOIN network_types nt ON n.network_type_id = nt.network_type_id
    WHERE n.title_id = @title_id;


    -----------------------------------------------------
    -- 7. TANGGAL TAYANG / EPISODES
    -----------------------------------------------------
    SELECT
        a.date,
        a.is_first,
        e.seasonNumber,
        e.episodeNumber
    FROM air_dates a
    LEFT JOIN episodes e ON a.title_id = e.title_id
    WHERE a.title_id = @title_id;


    -----------------------------------------------------
    -- 8. CAST & CREW
    -----------------------------------------------------
    SELECT 
        tp.ordering,
        p.primaryName AS person_name,
        tp.category AS job_category,
        tp.characters
    FROM title_principals tp
    JOIN persons p ON tp.person_id = p.person_id
    WHERE tp.title_id = @title_id
    ORDER BY tp.ordering;
END
GO
select * from titles where name= 'Breaking Bad'
EXEC sp_GetTitleDetail @title_id = 'tt1234567';
SELECT 
    t.*,
    ty.type_name,
    s.status_name
FROM titles t
LEFT JOIN types ty ON t.type_id = ty.type_id
LEFT JOIN status s ON t.status_id = s.status_id
WHERE t.title_id = '1396';
