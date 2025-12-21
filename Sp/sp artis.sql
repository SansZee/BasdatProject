create unique index idx_ft_persons_person_id
on persons(person_id)
create fulltext catalog ft_artist_catalog
as default
create fulltext index on persons
(
    primaryName language 1033
)
key index idx_ft_persons_person_id
with change_tracking auto

CREATE INDEX idx_tp_person_id
ON title_principals(person_id);

CREATE INDEX idx_known_for_person_id
ON known_for(person_id);

CREATE INDEX idx_professions_person_id
ON professions(person_id);

CREATE INDEX idx_titles_startYear
ON titles(startYear);

DROP FULLTEXT INDEX ON persons;
ALTER TABLE persons
ALTER COLUMN primaryName NVARCHAR(255);


CREATE INDEX idx_persons_primaryName
ON persons(primaryName);

-----------------------------------------------------------------------------
CREATE OR ALTER PROCEDURE sp_search_artists
    @keyword NVARCHAR(100),
    @limit INT = 15
AS
BEGIN
    SET NOCOUNT ON;

    IF LEN(@keyword) < 2
    BEGIN
        SELECT TOP (@limit)
            p.person_id,
            p.primaryName,
            p.birthYear,
            p.deathYear,
            0 AS total_titles,
            0 AS total_votes,
            0 AS avg_rating
        FROM persons p
        ORDER BY p.primaryName;
        RETURN;
    END;

    DECLARE @searchPattern NVARCHAR(200) = @keyword + '%';

    -- Scan only matching persons, then join to aggregates
    ;WITH matched_persons AS (
        SELECT TOP (@limit)
            p.person_id,
            p.primaryName,
            p.birthYear,
            p.deathYear
        FROM persons p
        WHERE p.primaryName LIKE @searchPattern COLLATE Latin1_General_CI_AS
        ORDER BY p.primaryName
    ),
    stats AS (
        SELECT
            tp.person_id,
            COUNT(*) AS total_titles,
            SUM(ISNULL(t.vote_count, 0)) AS total_votes,
            AVG(NULLIF(t.vote_average, 0)) AS avg_rating
        FROM matched_persons mp
        JOIN title_principals tp ON tp.person_id = mp.person_id
        JOIN titles t ON t.title_id = tp.title_id
        GROUP BY tp.person_id
    )
    SELECT
        mp.person_id,
        mp.primaryName,
        mp.birthYear,
        mp.deathYear,
        ISNULL(s.total_titles, 0) AS total_titles,
        ISNULL(s.total_votes, 0) AS total_votes,
        ISNULL(s.avg_rating, 0) AS avg_rating
    FROM matched_persons mp
    LEFT JOIN stats s ON s.person_id = mp.person_id
    ORDER BY
        ISNULL(s.total_votes, 0) DESC,
        ISNULL(s.total_titles, 0) DESC,
        mp.primaryName;
END;

EXEC sp_search_artists @keyword = 'leonardo';


-----------------------------------------------------------------------------
CREATE PROCEDURE sp_get_top_artists
AS
BEGIN
    SELECT TOP 15
           persons.person_id,
           persons.primaryname,
           COUNT(title_principals.title_id) AS total_titles
    FROM persons
    JOIN title_principals
        ON persons.person_id = title_principals.person_id
    GROUP BY persons.person_id, persons.primaryname
    ORDER BY total_titles DESC
END
exec sp_get_top_artists

SELECT person_id, COUNT(*) AS total_titles
FROM title_principals
GROUP BY person_id

-----------------------------------------------------------------
EXEC sp_search_artists @keyword = 'leonardo';
------------------------------------------------------------------

CREATE OR ALTER PROCEDURE sp_get_artist_detail
    @person_id NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        p.person_id,
        p.primaryName,
        p.birthYear,
        p.deathYear
    FROM persons p
    WHERE p.person_id = @person_id;
END;
GO


CREATE OR ALTER PROCEDURE sp_get_artist_professions
    @person_id NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        pt.profession
    FROM professions pr
    INNER JOIN profession_type pt
        ON pr.profession_id = pt.profession_id
    WHERE pr.person_id = @person_id
    ORDER BY pt.profession;
END;
GO


CREATE OR ALTER PROCEDURE sp_get_artist_known_for
    @person_id NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        k.title_id,
        t.name,
        t.startYear,
        t.endYear,
        t.vote_average,
        t.vote_count,
        t.popularity
    FROM known_for k
    INNER JOIN titles t
        ON k.title_id = t.title_id
    INNER JOIN dbo.FilterTitles() ft
        ON t.title_id = ft.title_id
    WHERE k.person_id = @person_id
    ORDER BY t.popularity DESC;
END;
GO

CREATE OR ALTER PROCEDURE sp_get_artist_all_titles
    @person_id NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;

    SELECT
        tp.title_id,
        t.name,
        t.type_id,
        t.startYear,
        t.endYear,
        STRING_AGG(tp.category, ', ') AS category,
        STRING_AGG(tp.job, ', ') AS job,
        STRING_AGG(tp.characters, ', ') AS characters
    FROM title_principals tp
    INNER JOIN titles t
        ON tp.title_id = t.title_id
    INNER JOIN dbo.FilterTitles() ft
        ON t.title_id = ft.title_id
    WHERE tp.person_id = @person_id
    GROUP BY tp.title_id, t.name, t.type_id, t.startYear, t.endYear
    ORDER BY t.startYear DESC;
END;
GO
EXEC sp_search_artists @keyword = 'Tom';
EXEC sp_get_artist_detail 'nm0000138'