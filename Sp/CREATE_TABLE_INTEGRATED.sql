-- ============================================
-- COMPLETE DATABASE SCHEMA CREATION SCRIPT
-- ============================================

USE [INTEGRASI_DB]
GO

-- ============================================
-- SECTION 1: DROP EXISTING TABLES (if exists)
-- ============================================

BEGIN TRANSACTION;
BEGIN TRY

    PRINT '============================================';
    PRINT 'Dropping existing tables...';
    PRINT '============================================';

    -- Drop junction/relationship tables first (with FK constraints)
    IF OBJECT_ID('dbo.air_dates', 'U') IS NOT NULL DROP TABLE dbo.air_dates;
    IF OBJECT_ID('dbo.genres', 'U') IS NOT NULL DROP TABLE dbo.genres;
    IF OBJECT_ID('dbo.known_for', 'U') IS NOT NULL DROP TABLE dbo.known_for;
    IF OBJECT_ID('dbo.languages', 'U') IS NOT NULL DROP TABLE dbo.languages;
    IF OBJECT_ID('dbo.links', 'U') IS NOT NULL DROP TABLE dbo.links;
    IF OBJECT_ID('dbo.networks', 'U') IS NOT NULL DROP TABLE dbo.networks;
    IF OBJECT_ID('dbo.production_companies', 'U') IS NOT NULL DROP TABLE dbo.production_companies;
    IF OBJECT_ID('dbo.production_countries', 'U') IS NOT NULL DROP TABLE dbo.production_countries;
    IF OBJECT_ID('dbo.professions', 'U') IS NOT NULL DROP TABLE dbo.professions;
    IF OBJECT_ID('dbo.spoken_languages', 'U') IS NOT NULL DROP TABLE dbo.spoken_languages;
    IF OBJECT_ID('dbo.title_principals', 'U') IS NOT NULL DROP TABLE dbo.title_principals;
    IF OBJECT_ID('dbo.episodes', 'U') IS NOT NULL DROP TABLE dbo.episodes;
    IF OBJECT_ID('dbo.alternate_titles', 'U') IS NOT NULL DROP TABLE dbo.alternate_titles;
    
    -- Drop main tables
    IF OBJECT_ID('dbo.titles', 'U') IS NOT NULL DROP TABLE dbo.titles;
    IF OBJECT_ID('dbo.persons', 'U') IS NOT NULL DROP TABLE dbo.persons;
    
    -- Drop lookup/type tables
    IF OBJECT_ID('dbo.genre_types', 'U') IS NOT NULL DROP TABLE dbo.genre_types;
    IF OBJECT_ID('dbo.language_types', 'U') IS NOT NULL DROP TABLE dbo.language_types;
    IF OBJECT_ID('dbo.link_types', 'U') IS NOT NULL DROP TABLE dbo.link_types;
    IF OBJECT_ID('dbo.network_types', 'U') IS NOT NULL DROP TABLE dbo.network_types;
    IF OBJECT_ID('dbo.origin_country_types', 'U') IS NOT NULL DROP TABLE dbo.origin_country_types;
    IF OBJECT_ID('dbo.production_company_types', 'U') IS NOT NULL DROP TABLE dbo.production_company_types;
    IF OBJECT_ID('dbo.production_country_types', 'U') IS NOT NULL DROP TABLE dbo.production_country_types;
    IF OBJECT_ID('dbo.profession_type', 'U') IS NOT NULL DROP TABLE dbo.profession_type;
    IF OBJECT_ID('dbo.spoken_language_types', 'U') IS NOT NULL DROP TABLE dbo.spoken_language_types;
    IF OBJECT_ID('dbo.status', 'U') IS NOT NULL DROP TABLE dbo.status;
    IF OBJECT_ID('dbo.types', 'U') IS NOT NULL DROP TABLE dbo.types;

    PRINT '✓ Existing tables dropped';

    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT 'Error dropping tables: ' + ERROR_MESSAGE();
END CATCH;
GO

-- ============================================
-- SECTION 2: CREATE LOOKUP/TYPE TABLES (with PK)
-- ============================================

BEGIN TRANSACTION;
BEGIN TRY

    PRINT '============================================';
    PRINT 'Creating lookup/type tables...';
    PRINT '============================================';

    -- 1. genre_types
    CREATE TABLE genre_types (
        genre_type_id NVARCHAR(20) NOT NULL,
        genre_name NVARCHAR(255) NULL,
        CONSTRAINT PK_genre_types PRIMARY KEY (genre_type_id)
    );
    PRINT '✓ genre_types created';

    -- 2. language_types
    CREATE TABLE language_types (
        language_type_id NVARCHAR(20) NOT NULL,
        language_name NVARCHAR(200) NULL,
        CONSTRAINT PK_language_types PRIMARY KEY (language_type_id)
    );
    PRINT '✓ language_types created';

    -- 3. link_types
    CREATE TABLE link_types (
        link_type_id NVARCHAR(20) NOT NULL,
        link_type NVARCHAR(100) NULL,
        CONSTRAINT PK_link_types PRIMARY KEY (link_type_id)
    );
    PRINT '✓ link_types created';

    -- 4. network_types
    CREATE TABLE network_types (
        network_type_id NVARCHAR(20) NOT NULL,
        network_name NVARCHAR(200) NULL,
        CONSTRAINT PK_network_types PRIMARY KEY (network_type_id)
    );
    PRINT '✓ network_types created';

    -- 5. origin_country_types
    CREATE TABLE origin_country_types (
        origin_country_type_id NVARCHAR(20) NOT NULL,
        origin_country_name NVARCHAR(40) NULL,
        CONSTRAINT PK_origin_country_types PRIMARY KEY (origin_country_type_id)
    );
    PRINT '✓ origin_country_types created';

    -- 6. production_company_types
    CREATE TABLE production_company_types (
        production_company_type_id NVARCHAR(20) NOT NULL,
        production_company_name NVARCHAR(200) NULL,
        CONSTRAINT PK_production_company_types PRIMARY KEY (production_company_type_id)
    );
    PRINT '✓ production_company_types created';

    -- 7. production_country_types
    CREATE TABLE production_country_types (
        production_country_type_id NVARCHAR(20) NOT NULL,
        production_country_name NVARCHAR(100) NULL,
        CONSTRAINT PK_production_country_types PRIMARY KEY (production_country_type_id)
    );
    PRINT '✓ production_country_types created';

    -- 8. profession_type
    CREATE TABLE profession_type (
        profession_id INT IDENTITY(1,1) NOT NULL,
        profession NVARCHAR(50) NULL,
        CONSTRAINT PK_profession_type PRIMARY KEY (profession_id)
    );
    PRINT '✓ profession_type created';

    -- 9. spoken_language_types
    CREATE TABLE spoken_language_types (
        spoken_language_type_id NVARCHAR(20) NOT NULL,
        spoken_language_name NVARCHAR(MAX) NULL,
        CONSTRAINT PK_spoken_language_types PRIMARY KEY (spoken_language_type_id)
    );
    PRINT '✓ spoken_language_types created';

    -- 10. status
    CREATE TABLE status (
        status_id NVARCHAR(20) NOT NULL,
        status_name NVARCHAR(100) NULL,
        CONSTRAINT PK_status PRIMARY KEY (status_id)
    );
    PRINT '✓ status created';

    -- 11. types
    CREATE TABLE types (
        type_id NVARCHAR(20) NOT NULL,
        type_name NVARCHAR(50) NULL,
        CONSTRAINT PK_types PRIMARY KEY (type_id)
    );
    PRINT '✓ types created';

    COMMIT TRANSACTION;
    PRINT '============================================';
    PRINT 'Lookup/type tables created: 11 tables';
    PRINT '============================================';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT 'Error creating lookup tables: ' + ERROR_MESSAGE();
END CATCH;
GO

-- ============================================
-- SECTION 3: CREATE MAIN TABLES (with PK)
-- ============================================

BEGIN TRANSACTION;
BEGIN TRY

    PRINT '============================================';
    PRINT 'Creating main tables...';
    PRINT '============================================';

    -- 1. persons
    CREATE TABLE persons (
        person_id NVARCHAR(20) NOT NULL,
        primaryName NVARCHAR(MAX) NULL,
        birthYear SMALLINT NULL,
        deathYear SMALLINT NULL,
        CONSTRAINT PK_persons PRIMARY KEY (person_id)
    );
    PRINT '✓ persons created';

    -- 2. titles
    CREATE TABLE titles (
        title_id NVARCHAR(20) NOT NULL,
        name NVARCHAR(640) NULL,
        number_of_seasons INT NULL,
        number_of_episodes INT NULL,
        overview NVARCHAR(MAX) NULL,
        adult BIT NULL,
        in_production BIT NULL,
        original_name NVARCHAR(640) NULL,
        popularity INT NULL,
        tagline NVARCHAR(MAX) NULL,
        runtimeMinutes INT NULL,
        type_id NVARCHAR(20) NULL,
        status_id NVARCHAR(20) NULL,
        vote_count INT NULL,
        vote_average DECIMAL(3,1) NULL,
        startYear SMALLINT NULL,
        endYear SMALLINT NULL,
        CONSTRAINT PK_titles PRIMARY KEY (title_id)
    );
    PRINT '✓ titles created';

    -- 3. alternate_titles
    CREATE TABLE alternate_titles (
        title_id NVARCHAR(20) NOT NULL,
        title NVARCHAR(MAX) NULL,
        ordering INT NULL,
        region NVARCHAR(MAX) NULL,
        language NVARCHAR(MAX) NULL,
        types NVARCHAR(MAX) NULL,
        attributes NVARCHAR(MAX) NULL,
        isOriginalTitle BIT NULL,
        CONSTRAINT PK_alternate_titles PRIMARY KEY (title_id)
    );
    PRINT '✓ alternate_titles created';

    COMMIT TRANSACTION;
    PRINT '============================================';
    PRINT 'Main tables created: 3 tables';
    PRINT '============================================';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT 'Error creating main tables: ' + ERROR_MESSAGE();
END CATCH;
GO

-- ============================================
-- SECTION 4: CREATE JUNCTION/RELATIONSHIP TABLES (no PK)
-- ============================================

BEGIN TRANSACTION;
BEGIN TRY

    PRINT '============================================';
    PRINT 'Creating junction/relationship tables...';
    PRINT '============================================';

    -- 1. air_dates
    CREATE TABLE air_dates (
        is_first BIT NULL,
        title_id NVARCHAR(20) NULL,
        date DATE NULL
    );
    PRINT '✓ air_dates created';

    -- 2. genres
    CREATE TABLE genres (
        title_id NVARCHAR(20) NULL,
        genre_type_id NVARCHAR(20) NULL
    );
    PRINT '✓ genres created';

    -- 3. known_for
    CREATE TABLE known_for (
        person_id NVARCHAR(20) NULL,
        title_id NVARCHAR(20) NULL
    );
    PRINT '✓ known_for created';

    -- 4. languages
    CREATE TABLE languages (
        title_id NVARCHAR(20) NULL,
        language_type_id NVARCHAR(20) NULL
    );
    PRINT '✓ languages created';

    -- 5. links
    CREATE TABLE links (
        link_type_id NVARCHAR(20) NULL,
        title_id NVARCHAR(20) NULL,
        Link NVARCHAR(MAX) NULL
    );
    PRINT '✓ links created';

    -- 6. networks
    CREATE TABLE networks (
        title_id NVARCHAR(20) NULL,
        network_type_id NVARCHAR(20) NULL
    );
    PRINT '✓ networks created';

    -- 7. production_companies
    CREATE TABLE production_companies (
        title_id NVARCHAR(20) NULL,
        production_company_type_id NVARCHAR(20) NULL
    );
    PRINT '✓ production_companies created';

    -- 8. production_countries
    CREATE TABLE production_countries (
        title_id NVARCHAR(20) NULL,
        production_country_type_id NVARCHAR(20) NULL,
        origin_country_type_id NVARCHAR(20) NULL
    );
    PRINT '✓ production_countries created';

    -- 9. professions
    CREATE TABLE professions (
        person_id NVARCHAR(20) NULL,
        profession_id INT NULL
    );
    PRINT '✓ professions created';

    -- 10. spoken_languages
    CREATE TABLE spoken_languages (
        title_id NVARCHAR(20) NULL,
        spoken_language_type_id NVARCHAR(20) NULL
    );
    PRINT '✓ spoken_languages created';

    -- 11. title_principals
    CREATE TABLE title_principals (
        title_id NVARCHAR(20) NULL,
        ordering INT NULL,
        person_id NVARCHAR(20) NULL,
        category NVARCHAR(100) NULL,
        job NVARCHAR(MAX) NULL,
        characters NVARCHAR(MAX) NULL
    );
    PRINT '✓ title_principals created';

    -- 12. episodes
    CREATE TABLE episodes (
        title_id NVARCHAR(20) NOT NULL,
        parent_title_id NVARCHAR(20) NOT NULL,
        seasonNumber INT NULL,
        episodeNumber INT NULL
    );
    PRINT '✓ episodes created';

    COMMIT TRANSACTION;
    PRINT '============================================';
    PRINT 'Junction/relationship tables created: 12 tables';
    PRINT '============================================';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT 'Error creating junction tables: ' + ERROR_MESSAGE();
END CATCH;
GO

-- ============================================
-- SECTION 5: ADD FOREIGN KEY CONSTRAINTS
-- ============================================

BEGIN TRANSACTION;
BEGIN TRY

    PRINT '============================================';
    PRINT 'Adding foreign key constraints...';
    PRINT '============================================';

    -- 1. titles → types, status
    ALTER TABLE titles
    ADD CONSTRAINT FK_titles_types FOREIGN KEY (type_id) REFERENCES types(type_id);
    
    ALTER TABLE titles
    ADD CONSTRAINT FK_titles_status FOREIGN KEY (status_id) REFERENCES status(status_id);
    PRINT '✓ FK: titles → types, status';

    -- 2. air_dates → titles
    ALTER TABLE air_dates
    ADD CONSTRAINT FK_air_dates_titles FOREIGN KEY (title_id) REFERENCES titles(title_id);
    PRINT '✓ FK: air_dates → titles';

    -- 3. genres → titles, genre_types
    ALTER TABLE genres
    ADD CONSTRAINT FK_genres_titles FOREIGN KEY (title_id) REFERENCES titles(title_id);
    
    ALTER TABLE genres
    ADD CONSTRAINT FK_genres_genre_types FOREIGN KEY (genre_type_id) REFERENCES genre_types(genre_type_id);
    PRINT '✓ FK: genres → titles, genre_types';

    -- 4. known_for → persons (only person, not title)
    ALTER TABLE known_for
    ADD CONSTRAINT FK_known_for_persons FOREIGN KEY (person_id) REFERENCES persons(person_id);
    PRINT '✓ FK: known_for → persons';

    -- 5. languages → titles, language_types
    ALTER TABLE languages
    ADD CONSTRAINT FK_languages_titles FOREIGN KEY (title_id) REFERENCES titles(title_id);
    
    ALTER TABLE languages
    ADD CONSTRAINT FK_languages_language_types FOREIGN KEY (language_type_id) REFERENCES language_types(language_type_id);
    PRINT '✓ FK: languages → titles, language_types';

    -- 6. links → titles, link_types
    ALTER TABLE links
    ADD CONSTRAINT FK_links_titles FOREIGN KEY (title_id) REFERENCES titles(title_id);
    
    ALTER TABLE links
    ADD CONSTRAINT FK_links_link_types FOREIGN KEY (link_type_id) REFERENCES link_types(link_type_id);
    PRINT '✓ FK: links → titles, link_types';

    -- 7. networks → titles, network_types
    ALTER TABLE networks
    ADD CONSTRAINT FK_networks_titles FOREIGN KEY (title_id) REFERENCES titles(title_id);
    
    ALTER TABLE networks
    ADD CONSTRAINT FK_networks_network_types FOREIGN KEY (network_type_id) REFERENCES network_types(network_type_id);
    PRINT '✓ FK: networks → titles, network_types';

    -- 8. production_companies → titles, production_company_types
    ALTER TABLE production_companies
    ADD CONSTRAINT FK_production_companies_titles FOREIGN KEY (title_id) REFERENCES titles(title_id);
    
    ALTER TABLE production_companies
    ADD CONSTRAINT FK_production_companies_types FOREIGN KEY (production_company_type_id) REFERENCES production_company_types(production_company_type_id);
    PRINT '✓ FK: production_companies → titles, production_company_types';

    -- 9. production_countries → titles, production_country_types, origin_country_types
    ALTER TABLE production_countries
    ADD CONSTRAINT FK_production_countries_titles FOREIGN KEY (title_id) REFERENCES titles(title_id);
    
    ALTER TABLE production_countries
    ADD CONSTRAINT FK_production_countries_prod_country_types FOREIGN KEY (production_country_type_id) REFERENCES production_country_types(production_country_type_id);
    
    ALTER TABLE production_countries
    ADD CONSTRAINT FK_production_countries_origin_country_types FOREIGN KEY (origin_country_type_id) REFERENCES origin_country_types(origin_country_type_id);
    PRINT '✓ FK: production_countries → titles, production_country_types, origin_country_types';

    -- 10. professions → persons, profession_type
    ALTER TABLE professions
    ADD CONSTRAINT FK_professions_persons FOREIGN KEY (person_id) REFERENCES persons(person_id);
    
    ALTER TABLE professions
    ADD CONSTRAINT FK_professions_profession_type FOREIGN KEY (profession_id) REFERENCES profession_type(profession_id);
    PRINT '✓ FK: professions → persons, profession_type';

    -- 11. spoken_languages → titles, spoken_language_types
    ALTER TABLE spoken_languages
    ADD CONSTRAINT FK_spoken_languages_titles FOREIGN KEY (title_id) REFERENCES titles(title_id);
    
    ALTER TABLE spoken_languages
    ADD CONSTRAINT FK_spoken_languages_types FOREIGN KEY (spoken_language_type_id) REFERENCES spoken_language_types(spoken_language_type_id);
    PRINT '✓ FK: spoken_languages → titles, spoken_language_types';

    -- 12. title_principals → titles, persons
    ALTER TABLE title_principals
    ADD CONSTRAINT FK_title_principals_titles FOREIGN KEY (title_id) REFERENCES titles(title_id);
    
    ALTER TABLE title_principals
    ADD CONSTRAINT FK_title_principals_persons FOREIGN KEY (person_id) REFERENCES persons(person_id);
    PRINT '✓ FK: title_principals → titles, persons';

    -- 13. episodes → titles (self-referencing)
    ALTER TABLE episodes
    ADD CONSTRAINT FK_episodes_titles FOREIGN KEY (title_id) REFERENCES titles(title_id);
    
    ALTER TABLE episodes
    ADD CONSTRAINT FK_episodes_parent_titles FOREIGN KEY (parent_title_id) REFERENCES titles(title_id);
    PRINT '✓ FK: episodes → titles (self-referencing)';

    -- 14. alternate_titles → titles
    ALTER TABLE alternate_titles
    ADD CONSTRAINT FK_alternate_titles_titles FOREIGN KEY (title_id) REFERENCES titles(title_id);
    PRINT '✓ FK: alternate_titles → titles';

    COMMIT TRANSACTION;
    PRINT '============================================';
    PRINT 'ALL FOREIGN KEYS CREATED SUCCESSFULLY!';
    PRINT '============================================';
    PRINT 'Total Foreign Keys: 19';
    PRINT '============================================';

END TRY
BEGIN CATCH
    ROLLBACK TRANSACTION;
    PRINT 'Error creating foreign keys: ' + ERROR_MESSAGE();
END CATCH;
GO

-- ============================================
-- SECTION 6: VERIFICATION
-- ============================================

PRINT '============================================';
PRINT 'DATABASE SCHEMA CREATION COMPLETED!';
PRINT '============================================';

-- Count tables
SELECT 'Total Tables' AS info, COUNT(*) AS count
FROM sys.tables;

-- Count Primary Keys
SELECT 'Total Primary Keys' AS info, COUNT(*) AS count
FROM sys.key_constraints
WHERE type = 'PK';

-- Count Foreign Keys
SELECT 'Total Foreign Keys' AS info, COUNT(*) AS count
FROM sys.foreign_keys;

-- List all tables with PK status
SELECT 
    t.name AS table_name,
    CASE WHEN pk.name IS NOT NULL THEN 'YES' ELSE 'NO' END AS has_primary_key,
    pk.name AS pk_name
FROM sys.tables t
LEFT JOIN sys.key_constraints pk ON t.object_id = pk.parent_object_id AND pk.type = 'PK'
ORDER BY has_primary_key DESC, t.name;

-- List all Foreign Keys
SELECT 
    OBJECT_NAME(f.parent_object_id) AS table_name,
    f.name AS fk_name,
    COL_NAME(fc.parent_object_id, fc.parent_column_id) AS column_name,
    OBJECT_NAME(f.referenced_object_id) AS referenced_table,
    COL_NAME(fc.referenced_object_id, fc.referenced_column_id) AS referenced_column
FROM sys.foreign_keys AS f
INNER JOIN sys.foreign_key_columns AS fc ON f.object_id = fc.constraint_object_id
ORDER BY table_name, fk_name;

PRINT '============================================';
PRINT 'Summary:';
PRINT '- Lookup/Type Tables: 11 (with PK)';
PRINT '- Main Tables: 3 (with PK)';
PRINT '- Junction Tables: 12 (no PK)';
PRINT '- Total Tables: 26';
PRINT '- Total Primary Keys: 14';
PRINT '- Total Foreign Keys: 19';
PRINT '============================================';
GO