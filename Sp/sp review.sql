----------- Sp review 
USE INTEGRASI_DB;
GO
CREATE TABLE Reviews (
    review_id INT PRIMARY KEY IDENTITY(1,1),

    user_id INT NOT NULL,
    title_id NVARCHAR(20) NOT NULL,

    -- Rating 1–10
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 10),

    -- Teks review
    review_text NVARCHAR(MAX),

    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE(),

    -- Relasi ke Users
    CONSTRAINT FK_Reviews_Users FOREIGN KEY (user_id)
        REFERENCES Users(user_id),

    -- Relasi ke Titles
    CONSTRAINT FK_Reviews_Titles FOREIGN KEY (title_id)
        REFERENCES titles(title_id),

    -- 1 user hanya boleh mereview 1 kali per title
    CONSTRAINT UQ_Reviews UNIQUE(user_id, title_id)
);


CREATE TRIGGER TRG_Update_Reviews_Timestamp
ON Reviews
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE r
    SET updated_at = GETDATE()
    FROM Reviews r
    INNER JOIN inserted i
        ON r.review_id = i.review_id;
END;
GO

CREATE INDEX IX_Reviews_TitleId ON Reviews(title_id);
CREATE INDEX IX_Reviews_UserId ON Reviews(user_id);
select * from Reviews